import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Plan from '@/models/Plan';
import PlanBlock from '@/models/PlanBlock';
import { getCurrentUser } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/plans/[id] - Get a single plan with blocks
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const plan = await Plan.findOne({
      _id: id,
      userId: user.userId,
    }).lean();

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const blocks = await PlanBlock.find({ planId: id })
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({
      plan: {
        ...plan,
        blocks,
      },
    });
  } catch (error) {
    console.error('Get plan error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// PUT /api/plans/[id] - Update a plan
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, active, blocks } = body;

    await connectDB();

    // Find and verify ownership
    const plan = await Plan.findOne({
      _id: id,
      userId: user.userId,
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Update plan fields
    if (title !== undefined) {
      plan.title = title.trim();
    }

    if (active !== undefined) {
      // If setting this plan as active, deactivate others
      if (active) {
        await Plan.updateMany(
          { userId: user.userId, _id: { $ne: id } },
          { active: false }
        );
      }
      plan.active = active;
    }

    await plan.save();

    // Update blocks if provided
    if (blocks && Array.isArray(blocks)) {
      // Delete existing blocks
      await PlanBlock.deleteMany({ planId: id });

      // Create new blocks
      if (blocks.length > 0) {
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
    }

    // Fetch updated blocks
    const updatedBlocks = await PlanBlock.find({ planId: id })
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({
      message: 'Plan updated successfully',
      plan: {
        ...plan.toObject(),
        blocks: updatedBlocks,
      },
    });
  } catch (error) {
    console.error('Update plan error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// DELETE /api/plans/[id] - Delete a plan
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    // Find and verify ownership
    const plan = await Plan.findOne({
      _id: id,
      userId: user.userId,
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Delete all blocks associated with this plan
    await PlanBlock.deleteMany({ planId: id });

    // Delete the plan
    await Plan.deleteOne({ _id: id });

    return NextResponse.json({
      message: 'Plan deleted successfully',
    });
  } catch (error) {
    console.error('Delete plan error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
