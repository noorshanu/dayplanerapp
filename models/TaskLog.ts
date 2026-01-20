import mongoose, { Schema, Document, Model } from 'mongoose';

export type TaskStatus = 'pending' | 'completed' | 'snoozed' | 'missed';

export interface ISnoozeEntry {
  snoozedAt: Date;
  duration: number; // minutes
}

export interface ITaskLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  planBlockId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  status: TaskStatus;
  snoozeCount: number;
  completedAt: Date | null;
  snoozeHistory: ISnoozeEntry[];
  pointsEarned: number;
  createdAt: Date;
  updatedAt: Date;
}

const SnoozeEntrySchema = new Schema<ISnoozeEntry>(
  {
    snoozedAt: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const TaskLogSchema = new Schema<ITaskLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    planBlockId: {
      type: Schema.Types.ObjectId,
      ref: 'PlanBlock',
      required: true,
    },
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'snoozed', 'missed'],
      default: 'pending',
    },
    snoozeCount: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    snoozeHistory: {
      type: [SnoozeEntrySchema],
      default: [],
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
TaskLogSchema.index({ userId: 1, date: 1 });
TaskLogSchema.index({ userId: 1, planBlockId: 1, date: 1 }, { unique: true });

const TaskLog: Model<ITaskLog> =
  mongoose.models.TaskLog || mongoose.model<ITaskLog>('TaskLog', TaskLogSchema);

export default TaskLog;
