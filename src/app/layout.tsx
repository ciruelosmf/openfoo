import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/next';




export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Optional: Prevents zooming, consider accessibility
  // userScalable: false, // Optional: Prevents zooming, consider accessibility
  // themeColor: '#000000', // Optional: Set theme color for browser UI
};


const myCustomFont = localFont({
  src: [
    {
      path: './fonts/Codystar-Regular.ttf', // Path relative to where localFont is called
      weight: '400',
      style: 'normal',
    },
 
    // Add more weights/styles if you have them
  ],
  variable: '--font-cody', // CSS variable for your custom font
  display: 'swap',
});


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
  
export const metadata: Metadata = {
  title: "OpenFoo",
  description: "Minimal, open source AI chat with style",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <ClerkProvider 
    dynamic
    afterSignOutUrl="./">
    
    <html lang="en">
      <body
        className={`${geistSans.variable} ${myCustomFont.variable} ${geistMono.variable} antialiased`}
      >
      
        {children}
        
        <Analytics />
      </body>
    </html>
    
    </ClerkProvider>
  );
}
