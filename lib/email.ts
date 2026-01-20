import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"Day Planner" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

export async function sendVerificationEmail(
  email: string,
  otp: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 40px 20px; }
        .container { max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 32px; }
        .otp-box { background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1e293b; font-family: monospace; }
        .message { color: #64748b; line-height: 1.6; margin-bottom: 16px; }
        .footer { text-align: center; padding: 24px; color: #94a3b8; font-size: 14px; border-top: 1px solid #f1f5f9; }
        .warning { background: #fef3c7; border-radius: 8px; padding: 12px 16px; color: #92400e; font-size: 14px; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 Day Planner</h1>
        </div>
        <div class="content">
          <p class="message">Hi there! 👋</p>
          <p class="message">Thanks for signing up for Day Planner. Please use the verification code below to confirm your email address:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <div class="warning">
            ⏰ This code expires in 5 minutes and can only be used once.
          </div>
        </div>
        <div class="footer">
          If you didn't create an account, please ignore this email.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: '🔐 Verify your Day Planner account',
    html,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  otp: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 40px 20px; }
        .container { max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); padding: 32px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 32px; }
        .otp-box { background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1e293b; font-family: monospace; }
        .message { color: #64748b; line-height: 1.6; margin-bottom: 16px; }
        .footer { text-align: center; padding: 24px; color: #94a3b8; font-size: 14px; border-top: 1px solid #f1f5f9; }
        .warning { background: #fef3c7; border-radius: 8px; padding: 12px 16px; color: #92400e; font-size: 14px; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔑 Password Reset</h1>
        </div>
        <div class="content">
          <p class="message">Hi there! 👋</p>
          <p class="message">We received a request to reset your password. Use the code below to set a new password:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <div class="warning">
            ⏰ This code expires in 5 minutes and can only be used once.
          </div>
        </div>
        <div class="footer">
          If you didn't request a password reset, please ignore this email.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: '🔑 Reset your Day Planner password',
    html,
  });
}

export interface ReminderData {
  startTime: string;
  endTime: string;
  activity: string;
  topic?: string | null;
}

export async function sendReminderEmail(
  email: string,
  reminder: ReminderData
): Promise<boolean> {
  const topicLine = reminder.topic
    ? `<p style="margin: 8px 0 0; color: #64748b;">📚 Topic: ${reminder.topic}</p>`
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 40px 20px; }
        .container { max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 32px; }
        .reminder-box { background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-left: 4px solid #10b981; border-radius: 8px; padding: 20px; margin: 16px 0; }
        .time { font-size: 18px; font-weight: 600; color: #059669; margin-bottom: 8px; }
        .activity { font-size: 20px; font-weight: 600; color: #1e293b; }
        .message { color: #64748b; line-height: 1.6; }
        .footer { text-align: center; padding: 24px; color: #94a3b8; font-size: 14px; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Routine Reminder</h1>
        </div>
        <div class="content">
          <p class="message">It's time for your scheduled activity!</p>
          <div class="reminder-box">
            <p class="time">🕐 ${reminder.startTime} – ${reminder.endTime}</p>
            <p class="activity">✅ ${reminder.activity}</p>
            ${topicLine}
          </div>
          <p class="message">Stay focused and make the most of your time! 💪</p>
        </div>
        <div class="footer">
          Manage your reminders in Day Planner settings.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `⏰ Reminder: ${reminder.activity}`,
    html,
  });
}
