import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import TelegramLink from '@/models/TelegramLink';
import { getCurrentUser } from '@/lib/auth';
import { generateTelegramLinkToken } from '@/lib/telegram';

// POST /api/telegram/link - Generate a link token for the user
export async function POST() {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Generate unique token
    const linkToken = generateTelegramLinkToken();

    // Store in MongoDB (expires in 10 minutes)
    await TelegramLink.create({
      token: linkToken,
      userId: tokenUser.userId,
      email: tokenUser.email,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'letsplanourday_bot';
    const deepLink = `https://t.me/${botUsername}?start=${linkToken}`;

    return NextResponse.json({
      linkToken,
      deepLink,
      botUsername,
      expiresIn: 600, // 10 minutes in seconds
    });
  } catch (error) {
    console.error('Generate link token error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// DELETE /api/telegram/link - Disconnect Telegram
export async function DELETE() {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    await User.findByIdAndUpdate(tokenUser.userId, {
      telegramChatId: null,
      'reminderPrefs.telegram': false,
    });

    return NextResponse.json({
      message: 'Telegram disconnected successfully',
    });
  } catch (error) {
    console.error('Disconnect Telegram error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// GET /api/telegram/link?token=xxx&chatId=xxx - Verify and use a link token
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    const chatId = request.nextUrl.searchParams.get('chatId');

    if (!token || !chatId) {
      return NextResponse.json(
        { error: 'Token and chatId are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the pending link in MongoDB
    const pendingLink = await TelegramLink.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!pendingLink) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Update user with Telegram chat ID
    await User.findByIdAndUpdate(pendingLink.userId, {
      telegramChatId: chatId,
    });

    // Mark token as used
    pendingLink.used = true;
    await pendingLink.save();

    return NextResponse.json({
      message: 'Telegram connected successfully',
      email: pendingLink.email,
    });
  } catch (error) {
    console.error('Verify link token error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
