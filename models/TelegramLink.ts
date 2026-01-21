import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITelegramLink extends Document {
  _id: mongoose.Types.ObjectId;
  token: string;
  userId: mongoose.Types.ObjectId;
  email: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const TelegramLinkSchema = new Schema<ITelegramLink>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
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

// TTL index to auto-delete expired tokens after 1 hour
TelegramLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

const TelegramLink: Model<ITelegramLink> =
  mongoose.models.TelegramLink ||
  mongoose.model<ITelegramLink>('TelegramLink', TelegramLinkSchema);

export default TelegramLink;
