import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProviders from '@/components/SessionProviders';
import { ToastProvider } from '@/components/toast/ToastContext';
import { Toaster } from '@/components/toast/Toaster';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s - XOLOG App",
    default: "XOLOG live app",
    absolute: "XOLOG Home",
  },
  description:
    "XOLOG sal was founded to make a mark in Lebanese Freight Forwarding and Shipping industry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}> 
        <SessionProviders>
          <ToastProvider>
            {children}
            <Toaster />
          </ToastProvider>
        </SessionProviders>
      </body>
    </html>
  );
}
