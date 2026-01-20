import mongoose, { Schema, Document, Model } from 'mongoose';

export type Mood = 'great' | 'okay' | 'bad';

export interface IDailyReflection extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  mood: Mood;
  disciplineScore: number; // Snapshot of that day's score
  tasksCompleted: number;
  tasksMissed: number;
  totalSnoozes: number;
  createdAt: Date;
}

const DailyReflectionSchema = new Schema<IDailyReflection>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    mood: {
      type: String,
      enum: ['great', 'okay', 'bad'],
      required: true,
    },
    disciplineScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    tasksCompleted: {
      type: Number,
      default: 0,
    },
    tasksMissed: {
      type: Number,
      default: 0,
    },
    totalSnoozes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique daily reflections per user
DailyReflectionSchema.index({ userId: 1, date: 1 }, { unique: true });

const DailyReflection: Model<IDailyReflection> =
  mongoose.models.DailyReflection ||
  mongoose.model<IDailyReflection>('DailyReflection', DailyReflectionSchema);

export default DailyReflection;
