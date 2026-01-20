import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Day Planner - Master Your Daily Routine",
  description: "Plan your perfect day once, reuse it forever. Get timely reminders via email and Telegram to stay on track and achieve your goals.",
  keywords: ["daily planner", "routine", "productivity", "reminders", "schedule"],
  authors: [{ name: "Day Planner" }],
  openGraph: {
    title: "Day Planner - Master Your Daily Routine",
    description: "Plan your perfect day once, reuse it forever. Get timely reminders via email and Telegram.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
