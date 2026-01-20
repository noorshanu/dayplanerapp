import mongoose, { Schema, Document, Model } from 'mongoose';

export type OTPPurpose = 'email_verify' | 'reset_password';

export interface IOTP extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  otpHash: string;
  purpose: OTPPurpose;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const OTPSchema = new Schema<IOTP>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: [true, 'OTP hash is required'],
    },
    purpose: {
      type: String,
      enum: ['email_verify', 'reset_password'],
      required: [true, 'OTP purpose is required'],
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient lookups
OTPSchema.index({ email: 1, purpose: 1, used: 1 });

// TTL index to automatically delete expired OTPs after 1 hour
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

// Prevent model recompilation in development
const OTP: Model<IOTP> =
  mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema);

export default OTP;
