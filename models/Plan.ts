import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlan extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema = new Schema<IPlan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Plan title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
PlanSchema.index({ userId: 1, active: 1 });

// Prevent model recompilation in development
const Plan: Model<IPlan> =
  mongoose.models.Plan || mongoose.model<IPlan>('Plan', PlanSchema);

export default Plan;
