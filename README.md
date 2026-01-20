# 📅 Day Planner

A production-ready full-stack Daily Routine Planner with Email & Telegram reminders. Built with Next.js App Router, MongoDB, and Tailwind CSS.

![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?style=flat-square&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

- 🔐 **Secure Authentication** - Email/password with OTP email verification
- 🔑 **Password Recovery** - Forgot password flow with secure OTP reset
- 📋 **Plan Management** - Create, edit, delete daily routine plans
- ⏰ **Time Block Builder** - Add activities with start/end times
- 📧 **Email Reminders** - Beautiful HTML emails via Gmail SMTP
- 🤖 **Telegram Integration** - Connect bot for mobile reminders
- 🌍 **Timezone Support** - Per-user timezone configuration
- 🎨 **Modern UI** - Clean, responsive design with dark mode

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB database (Atlas or local)
- Gmail account with App Password
- Telegram Bot (optional, for mobile reminders)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/noorshanu/dayplanerapp.git
   cd dayplanerapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure `.env.local`**
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb+srv://...

   # JWT Secret (32+ characters)
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters

   # Gmail SMTP
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-gmail-app-password

   # Telegram Bot (optional)
   TELEGRAM_BOT_TOKEN=your-telegram-bot-token
   TELEGRAM_BOT_USERNAME=your_bot_username

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Cron Secret
   CRON_SECRET=your-cron-secret-key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

## 📁 Project Structure

```
dayplanerapp/
├── app/
│   ├── (auth)/              # Auth pages (login, signup, etc.)
│   ├── (dashboard)/         # Dashboard pages
│   ├── api/                 # API routes
│   ├── globals.css
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── landing/             # Landing page sections
│   └── ...                  # App components
├── lib/                     # Utilities (auth, email, db, etc.)
├── models/                  # Mongoose models
├── middleware.ts            # Route protection
└── vercel.json              # Cron configuration
```

## 🔐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/verify-email` | Verify OTP |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### Plans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/plans` | List all plans |
| POST | `/api/plans` | Create plan |
| GET | `/api/plans/[id]` | Get plan with blocks |
| PUT | `/api/plans/[id]` | Update plan |
| DELETE | `/api/plans/[id]` | Delete plan |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get user settings |
| PUT | `/api/settings` | Update settings |

## 📧 Gmail SMTP Setup

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Go to **App passwords**
4. Generate a new app password for "Mail"
5. Use this password in `SMTP_PASS`

## 🤖 Telegram Bot Setup

1. **Create Bot**
   - Open Telegram and search for `@BotFather`
   - Send `/newbot` and follow prompts
   - Copy the bot token to `TELEGRAM_BOT_TOKEN`

2. **Set Webhook** (after deploying)
   ```
   https://your-domain.vercel.app/api/telegram/webhook?secret=YOUR_CRON_SECRET
   ```

3. **Connect in App**
   - Go to Settings → Connect Telegram
   - Click the generated link to connect

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variables
   - Deploy

3. **Configure Cron** (included in `vercel.json`)
   ```json
   {
     "crons": [{
       "path": "/api/cron/reminder",
       "schedule": "* * * * *"
     }]
   }
   ```
   > Note: Per-minute crons require Vercel Pro plan

4. **Set Telegram Webhook**
   ```
   https://your-app.vercel.app/api/telegram/webhook?secret=YOUR_CRON_SECRET
   ```

## 🔒 Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **OTP Security**: SHA-256 hashed, 5-minute expiry, single-use
- **JWT Cookies**: httpOnly, secure in production
- **Rate Limiting**: Max 3 OTP requests per 15 minutes
- **Route Protection**: Middleware-based auth checks

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS 4
- **Auth**: JWT with httpOnly cookies
- **Email**: Nodemailer with Gmail SMTP
- **Deployment**: Vercel

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/noorshanu">Noor Shanu</a>
</p>
