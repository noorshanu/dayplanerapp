import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  telegramChatId: string | null;
  reminderPrefs: {
    email: boolean;
    telegram: boolean;
  };
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    telegramChatId: {
      type: String,
      default: null,
    },
    reminderPrefs: {
      email: {
        type: Boolean,
        default: true,
      },
      telegram: {
        type: Boolean,
        default: false,
      },
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
