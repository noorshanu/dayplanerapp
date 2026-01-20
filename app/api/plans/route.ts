import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Plan from '@/models/Plan';
import PlanBlock from '@/models/PlanBlock';
import { getCurrentUser } from '@/lib/auth';

// GET /api/plans - List all user's plans
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const plans = await Plan.find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .lean();

    // Get block counts for each plan
    const plansWithCounts = await Promise.all(
      plans.map(async (plan) => {
        const blockCount = await PlanBlock.countDocuments({ planId: plan._id });
        return {
          ...plan,
          blockCount,
        };
      })
    );

    return NextResponse.json({ plans: plansWithCounts });
  } catch (error) {
    console.error('Get plans error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// POST /api/plans - Create a new plan
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, blocks } = body;

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Plan title is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Create the plan
    const plan = await Plan.create({
      userId: user.userId,
      title: title.trim(),
      active: false,
    });

    // Create blocks if provided
    if (blocks && Array.isArray(blocks) && blocks.length > 0) {
      const blocksToCreate = blocks.map((block, index) => ({
        planId: plan._id,
        startTime: block.startTime,
        endTime: block.endTime,
        activity: block.activity,
        topic: block.topic || null,
        order: index,
      }));

      await PlanBlock.insertMany(blocksToCreate);
    }

    // Fetch the created plan with blocks
    const createdBlocks = await PlanBlock.find({ planId: plan._id })
      .sort({ order: 1 })
      .lean();

    return NextResponse.json(
      {
        message: 'Plan created successfully',
        plan: {
          ...plan.toObject(),
          blocks: createdBlocks,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create plan error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
