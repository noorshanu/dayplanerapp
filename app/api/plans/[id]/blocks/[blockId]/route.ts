import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Plan from '@/models/Plan';
import PlanBlock from '@/models/PlanBlock';
import { getCurrentUser } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string; blockId: string }>;
}

// PUT /api/plans/[id]/blocks/[blockId] - Update a block
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, blockId } = await params;
    const body = await request.json();
    const { startTime, endTime, activity, topic, order } = body;

    await connectDB();

    // Verify plan ownership
    const plan = await Plan.findOne({
      _id: id,
      userId: user.userId,
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Find the block
    const block = await PlanBlock.findOne({
      _id: blockId,
      planId: id,
    });

    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    // Validate time format if provided
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (startTime && !timeRegex.test(startTime)) {
      return NextResponse.json(
        { error: 'Start time must be in HH:mm format' },
        { status: 400 }
      );
    }
    if (endTime && !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: 'End time must be in HH:mm format' },
        { status: 400 }
      );
    }

    // Update fields
    if (startTime !== undefined) block.startTime = startTime;
    if (endTime !== undefined) block.endTime = endTime;
    if (activity !== undefined) block.activity = activity.trim();
    if (topic !== undefined) block.topic = topic?.trim() || null;
    if (order !== undefined) block.order = order;

    await block.save();

    return NextResponse.json({
      message: 'Block updated successfully',
      block,
    });
  } catch (error) {
    console.error('Update block error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// DELETE /api/plans/[id]/blocks/[blockId] - Delete a block
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, blockId } = await params;

    await connectDB();

    // Verify plan ownership
    const plan = await Plan.findOne({
      _id: id,
      userId: user.userId,
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Find and delete the block
    const block = await PlanBlock.findOneAndDelete({
      _id: blockId,
      planId: id,
    });

    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Block deleted successfully',
    });
  } catch (error) {
    console.error('Delete block error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
