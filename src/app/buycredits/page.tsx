// src/app/buycredits/page.tsx
'use client';

import React from 'react';
import {  Public_Sans, Teko, Space_Grotesk  } from "next/font/google";
import Image from "next/image";
import Link from 'next/link';
 import {
  SignInButton,
  SignedIn,
  UserButton,
  SignUpButton,
  SignedOut,
} from '@clerk/nextjs'
const tekoFont = Teko({
  subsets: ["latin"],
  weight: "600", // Using a slightly bolder weight for Teko for more impact
});
const publicFont = Public_Sans({
  subsets: ["latin"],
  weight: "400",
});const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});




// IMPORTANT: Replace these with your actual Stripe Price IDs
const PRICE_ID_PRODUCT_1 = 'price_YOUR_FIRST_PRODUCT_ID'; // e.g., for 10 credits
const PRICE_ID_PRODUCT_2 = 'price_YOUR_SECOND_PRODUCT_ID'; // e.g., for 50 credits

export default function PricingPage() {
  // Modified handlePurchase to accept a priceId
  const handlePurchase = async (priceId: string) => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId, // Use the passed priceId
        }),
      });

      if (!response.ok) {
        // It's good to get more specific error info if available
        const errorData = await response.json().catch(() => ({ message: 'Unknown server error' }));
        throw new Error(`Server Error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.log('Error:', error);
      // You might want to show a user-friendly error message here
      // For example, using a state variable and displaying it in the UI
      alert(`Purchase failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };





  return (
    <main className=  {`    ${spaceGrotesk.className}    min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 `}>
      
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Image
                  src="/logo_.png"
                  alt="GenFoo Logo"
                  width={40}
                  height={40}
                  className="rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
                  priority
                />
              </div>
              <span className={`${tekoFont.className} text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors`}>
                GenFoo
              </span>
            </Link>

            <div className="flex items-center space-x-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className={`${spaceGrotesk.className} px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200`}>
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className={`${spaceGrotesk.className} px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200`}>
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>
<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">

      <h1 className="text-4xl font-bold mb-12">Buy Credits</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Product 1 Card */}
        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col">
          <h2 className="text-2xl font-semibold mb-3">Standard Pack</h2>
          <p className="text-gray-600 mb-2">Get 1000 credits.</p>
          <p className="text-3xl font-bold mb-6 text-blue-600">$6.9</p> {/* Example price display */}
          <button
            onClick={() => handlePurchase(PRICE_ID_PRODUCT_1)}
            className="mt-auto w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Buy 1000 Credits
          </button>
        </div>

        {/* Product 2 Card */}
        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col">
          <h2 className="text-2xl font-semibold mb-3">Premium Pack</h2>
          <p className="text-gray-600 mb-2">Get 10000 credits.</p>
          <p className="text-3xl font-bold mb-6 text-green-600">$49</p> {/* Example price display */}
          <button
            onClick={() => handlePurchase(PRICE_ID_PRODUCT_2)}
            className="mt-auto w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Buy 10000 Credits
          </button>
        </div>
      </div>

      {/* Optional: Add a footer or other info */}
      <p className="mt-12 text-sm text-gray-500">
        Secure payments powered by Stripe.
      </p>
</div>





 {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <Image
                  src="/logo_.png"
                  alt="GenFoo Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className={`${spaceGrotesk.className} text-xl font-bold`}>GenFoo</span>
              </div>
              <p className={`${spaceGrotesk.className} text-slate-400 max-w-md leading-relaxed`}>
                Transforming AI conversations with beautiful, personalized interfaces that match your unique style and workflow.
              </p>
            </div>

            <div>
              <h3 className={`${spaceGrotesk.className} font-semibold mb-4`}>Product</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className={`${spaceGrotesk.className} text-slate-400 hover:text-white transition-colors`}>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/buycredits" className={`${spaceGrotesk.className} text-slate-400 hover:text-white transition-colors`}>
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className={`${spaceGrotesk.className} font-semibold mb-4`}>Other Projects</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="https://rocketcatcher69.vercel.app" className={`${spaceGrotesk.className} text-slate-400 hover:text-white transition-colors`}>
                    RocketCatcher69
                  </Link>
                </li>
                <li>
                  <Link href="https://t.me/tate_chess_bot" className={`${spaceGrotesk.className} text-slate-400 hover:text-white transition-colors`}>
                    Tate Chess Bot
                  </Link>
                </li>
                <li>
                  <Link href="https://www.aiimageandvideogenerators.xyz/" className={`${spaceGrotesk.className} text-slate-400 hover:text-white transition-colors`}>
                    AI Generators
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className={`${spaceGrotesk.className} text-slate-400 text-sm`}>
              © 2025 GenFoo. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <Link href="/privacy" className={`${spaceGrotesk.className} text-slate-400 hover:text-white transition-colors text-sm`}>
                Privacy Policy
              </Link>
              <Link href="/terms" className={`${spaceGrotesk.className} text-slate-400 hover:text-white transition-colors text-sm`}>
                Terms of Service
              </Link>
              <a href="mailto:blueparrottech@gmail.com" className={`${spaceGrotesk.className} text-slate-400 hover:text-white transition-colors text-sm`}>
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>




    </main>
  );
}