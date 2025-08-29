import type { Metadata } from "next";
import { Geist } from "next/font/google";
import ClientThemeProvider from "@/components/ClientThemeProvider";
import InstagramSidebar from "@/components/InstagramSidebar";
import AuthHandler from "@/components/AuthHandler";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "AhmadInsta - Instagram Clone",
  description: "A modern Instagram clone built with Next.js and Supabase",
  keywords: ["social media", "instagram", "photos", "sharing", "nextjs", "supabase"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${geist.className} text-foreground bg-background`}>
        <ClientThemeProvider>
          <AuthHandler />
          <div className="flex w-full min-h-screen">
            <InstagramSidebar />
            <main className="instagram-main">
              {children}
            </main>
          </div>
        </ClientThemeProvider>
      </body>
    </html>
  );
}