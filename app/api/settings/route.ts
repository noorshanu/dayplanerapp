import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { TIMEZONES } from '@/lib/timezone';

// GET /api/settings - Get user settings
export async function GET() {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(tokenUser.userId).select(
      'email timezone reminderPrefs telegramChatId realityModeEnabled disciplineScore'
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      settings: {
        email: user.email,
        timezone: user.timezone,
        reminderPrefs: user.reminderPrefs,
        telegramConnected: !!user.telegramChatId,
        realityModeEnabled: user.realityModeEnabled || false,
        disciplineScore: user.disciplineScore || { today: 0, weeklyAverage: 0, bestDay: '' },
      },
      timezones: TIMEZONES,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { timezone, reminderPrefs, realityModeEnabled } = body;

    await connectDB();

    const user = await User.findById(tokenUser.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update timezone if provided
    if (timezone !== undefined) {
      // Validate timezone
      const validTimezone = TIMEZONES.find((tz) => tz.value === timezone);
      if (!validTimezone) {
        return NextResponse.json(
          { error: 'Invalid timezone' },
          { status: 400 }
        );
      }
      user.timezone = timezone;
    }

    // Update reminder preferences if provided
    if (reminderPrefs !== undefined) {
      if (typeof reminderPrefs.email === 'boolean') {
        user.reminderPrefs.email = reminderPrefs.email;
      }
      if (typeof reminderPrefs.telegram === 'boolean') {
        // Can only enable telegram if connected
        if (reminderPrefs.telegram && !user.telegramChatId) {
          return NextResponse.json(
            { error: 'Please connect Telegram first' },
            { status: 400 }
          );
        }
        user.reminderPrefs.telegram = reminderPrefs.telegram;
      }
    }

    // Update reality mode if provided
    if (typeof realityModeEnabled === 'boolean') {
      user.realityModeEnabled = realityModeEnabled;
    }

    await user.save();

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: {
        timezone: user.timezone,
        reminderPrefs: user.reminderPrefs,
        telegramConnected: !!user.telegramChatId,
        realityModeEnabled: user.realityModeEnabled,
      },
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
