import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;
const SALT_ROUNDS = 12;

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT Token management
export interface TokenPayload {
  userId: string;
  email: string;
  emailVerified: boolean;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// OTP generation and hashing
export function generateOTP(): string {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function hashOTP(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export function verifyOTP(otp: string, hash: string): boolean {
  return hashOTP(otp) === hash;
}

// Cookie management
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value || null;
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}

// Get current user from cookie
export async function getCurrentUser(): Promise<TokenPayload | null> {
  const token = await getAuthCookie();
  if (!token) return null;
  return verifyToken(token);
}

// Rate limiting for OTP (simple in-memory implementation)
// In production, use Redis or database
const otpRateLimits = new Map<string, { count: number; resetAt: number }>();

export function checkOTPRateLimit(email: string): {
  allowed: boolean;
  remainingAttempts: number;
  resetIn: number;
} {
  const now = Date.now();
  const limit = otpRateLimits.get(email);
  const maxAttempts = 3;
  const windowMs = 15 * 60 * 1000; // 15 minutes

  if (!limit || now > limit.resetAt) {
    otpRateLimits.set(email, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remainingAttempts: maxAttempts - 1, resetIn: windowMs };
  }

  if (limit.count >= maxAttempts) {
    return {
      allowed: false,
      remainingAttempts: 0,
      resetIn: limit.resetAt - now,
    };
  }

  limit.count++;
  return {
    allowed: true,
    remainingAttempts: maxAttempts - limit.count,
    resetIn: limit.resetAt - now,
  };
}
