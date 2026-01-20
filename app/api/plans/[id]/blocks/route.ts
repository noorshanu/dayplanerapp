import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Plan from '@/models/Plan';
import PlanBlock from '@/models/PlanBlock';
import { getCurrentUser } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/plans/[id]/blocks - Get all blocks for a plan
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    // Verify plan ownership
    const plan = await Plan.findOne({
      _id: id,
      userId: user.userId,
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const blocks = await PlanBlock.find({ planId: id })
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({ blocks });
  } catch (error) {
    console.error('Get blocks error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// POST /api/plans/[id]/blocks - Add a block to a plan
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { startTime, endTime, activity, topic } = body;

    // Validation
    if (!startTime || !endTime || !activity) {
      return NextResponse.json(
        { error: 'Start time, end time, and activity are required' },
        { status: 400 }
      );
    }

    // Validate time format
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: 'Time must be in HH:mm format' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify plan ownership
    const plan = await Plan.findOne({
      _id: id,
      userId: user.userId,
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Get the highest order number
    const lastBlock = await PlanBlock.findOne({ planId: id })
      .sort({ order: -1 })
      .lean();

    const order = lastBlock ? lastBlock.order + 1 : 0;

    // Create the block
    const block = await PlanBlock.create({
      planId: id,
      startTime,
      endTime,
      activity: activity.trim(),
      topic: topic?.trim() || null,
      order,
    });

    return NextResponse.json(
      {
        message: 'Block added successfully',
        block,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add block error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
