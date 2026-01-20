import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { generateOTP, hashOTP, checkOTPRateLimit } from '@/lib/auth';
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, purpose } = body;

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!purpose || !['email_verify', 'reset_password'].includes(purpose)) {
      return NextResponse.json(
        { error: 'Invalid purpose' },
        { status: 400 }
      );
    }

    // Check rate limit
    const rateLimit = checkOTPRateLimit(email.toLowerCase());
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many attempts. Please try again in ${Math.ceil(rateLimit.resetIn / 60000)} minutes`,
        },
        { status: 429 }
      );
    }

    await connectDB();

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json({
        message: 'If an account exists with this email, a verification code has been sent.',
      });
    }

    // For email verification, check if already verified
    if (purpose === 'email_verify' && user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Generate and store OTP
    const otp = generateOTP();
    const otpHash = hashOTP(otp);

    // Delete any existing OTPs for this email and purpose
    await OTP.deleteMany({ email: email.toLowerCase(), purpose });

    // Create new OTP
    await OTP.create({
      email: email.toLowerCase(),
      otpHash,
      purpose,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    // Send email
    let emailSent = false;
    if (purpose === 'email_verify') {
      emailSent = await sendVerificationEmail(email, otp);
    } else {
      emailSent = await sendPasswordResetEmail(email, otp);
    }

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Verification code sent to your email.',
      remainingAttempts: rateLimit.remainingAttempts,
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
