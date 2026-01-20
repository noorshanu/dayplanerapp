import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import OTP from '@/models/OTP';
import {
  hashPassword,
  generateOTP,
  hashOTP,
  checkOTPRateLimit,
} from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, confirmPassword } = body;

    // Validation
    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Email, password, and confirm password are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Check rate limit for OTP
    const rateLimit = checkOTPRateLimit(email.toLowerCase());
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many attempts. Please try again in ${Math.ceil(rateLimit.resetIn / 60000)} minutes`,
        },
        { status: 429 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      emailVerified: false,
      timezone: 'UTC',
      reminderPrefs: { email: true, telegram: false },
    });

    // Generate and store OTP
    const otp = generateOTP();
    const otpHash = hashOTP(otp);

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase(), purpose: 'email_verify' });

    // Create new OTP
    await OTP.create({
      email: email.toLowerCase(),
      otpHash,
      purpose: 'email_verify',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(email, otp);

    if (!emailSent) {
      // Delete user if email fails
      await User.deleteOne({ _id: user._id });
      await OTP.deleteMany({ email: email.toLowerCase() });
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Account created! Please check your email for the verification code.',
        email: email.toLowerCase(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
