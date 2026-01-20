import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlanBlock extends Document {
  _id: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  activity: string;
  topic: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const PlanBlockSchema = new Schema<IPlanBlock>(
  {
    planId: {
      type: Schema.Types.ObjectId,
      ref: 'Plan',
      required: [true, 'Plan ID is required'],
      index: true,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:mm format'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:mm format'],
    },
    activity: {
      type: String,
      required: [true, 'Activity is required'],
      trim: true,
      maxlength: [200, 'Activity cannot exceed 200 characters'],
    },
    topic: {
      type: String,
      default: null,
      trim: true,
      maxlength: [200, 'Topic cannot exceed 200 characters'],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
PlanBlockSchema.index({ planId: 1, order: 1 });

// Prevent model recompilation in development
const PlanBlock: Model<IPlanBlock> =
  mongoose.models.PlanBlock || mongoose.model<IPlanBlock>('PlanBlock', PlanBlockSchema);

export default PlanBlock;
