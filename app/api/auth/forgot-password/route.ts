import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { generateOTP, hashOTP, checkOTPRateLimit } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    // Find user (don't reveal if user doesn't exist)
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Generate and store OTP
      const otp = generateOTP();
      const otpHash = hashOTP(otp);

      // Delete any existing password reset OTPs
      await OTP.deleteMany({
        email: email.toLowerCase(),
        purpose: 'reset_password',
      });

      // Create new OTP
      await OTP.create({
        email: email.toLowerCase(),
        otpHash,
        purpose: 'reset_password',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      });

      // Send email
      await sendPasswordResetEmail(email, otp);
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: 'If an account exists with this email, a password reset code has been sent.',
      email: email.toLowerCase(),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
