import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { verifyOTP, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    // Validation
    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    if (otp.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid OTP format' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the OTP record
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      purpose: 'email_verify',
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP
    const isValidOTP = verifyOTP(otp, otpRecord.otpHash);
    if (!isValidOTP) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    // Update user's email verification status
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { emailVerified: true },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate JWT token and set cookie
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      emailVerified: true,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      message: 'Email verified successfully!',
      user: {
        id: user._id,
        email: user.email,
        timezone: user.timezone,
        reminderPrefs: user.reminderPrefs,
      },
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
