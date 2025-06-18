"use client";
import Image from "next/image";
import Link from 'next/link';
import { Inter, Space_Grotesk, Teko } from "next/font/google";

import {
  SignInButton,
  SignedIn,
  UserButton,
  SignUpButton,
  SignedOut,
} from '@clerk/nextjs'

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const tekoFont = Teko({
  subsets: ["latin"],
  weight: "600", // Using a slightly bolder weight for Teko for more impact
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Define your available themes here
const themes = [
  { name: 'Ghosthy', path: 'theme/ghosthy', description: 'A ghostly chat experience', imageUrl: '/ghost.webp' },
  { name: 'Ghib', path: 'theme/ghi', description: 'Studio Ghibli inspired', imageUrl: '/ghibli.webp' },
  { name: '8008', path: 'theme/8008', description: 'Retro console vibes', imageUrl: '/8008.webp' },
  { name: 'Apple II', path: 'theme/appleii', description: 'Classic terminal aesthetic', imageUrl: '/appleii.webp' },
  { name: 'Cons Code', path: 'theme/cons', description: 'Developer friendly', imageUrl: '/cons.webp' },
  { name: 'Paper', path: 'theme/paper', description: 'Clean and minimal', imageUrl: '/paper.webp' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50/30">
      {/* Navigation */}
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
                  <button className={`${inter.className} px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200`}>
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className={`${inter.className} px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200`}>
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

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 ">
          <div className="text-center">
            <div className="relative">
              <h1 className={`${tekoFont.className} text-9xl sm:text-[222px] lg:text-[322px] xl:text-[422px] font-bold tracking-tight`}>
                <span className="leading-[0.5] bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 
 bg-clip-text text-transparent">
                  GenFoo
                </span>
              </h1>
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-800/20 blur-3xl -z-10 opacity-30"></div>
            </div>
            
            <p className={`${inter.className} mt-1 text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed`}>
              We aim to make AI and LLMs personal.
            </p>
            
            <p className={`${inter.className} mt-1 text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed`}>
              These programs are helpful and useful. We need to learn and adapt the new civ object.
            </p>
          </div>
        </div>
      </section>
































            <div className="my-12 flex flex-col sm:flex-row items-center justify-center gap-4">
 
              <Link
                href="/buycredits"
                className={`${inter.className} px-4 py-2 bg-white hover:bg-slate-50 text-slate-900 font-semibold rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-all duration-300`}
              >
                View Pricing
              </Link>
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
              <p className={`${inter.className} text-slate-400 max-w-md leading-relaxed`}>
                Transforming AI conversations with beautiful, personalized interfaces that match your unique style and workflow.
              </p>
            </div>

            <div>
              <h3 className={`${spaceGrotesk.className} font-semibold mb-4`}>Product</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className={`${inter.className} text-slate-400 hover:text-white transition-colors`}>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/buycredits" className={`${inter.className} text-slate-400 hover:text-white transition-colors`}>
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className={`${spaceGrotesk.className} font-semibold mb-4`}>Other Projects</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="https://rocketcatcher69.vercel.app" className={`${inter.className} text-slate-400 hover:text-white transition-colors`}>
                    RocketCatcher69
                  </Link>
                </li>
                <li>
                  <Link href="https://t.me/tate_chess_bot" className={`${inter.className} text-slate-400 hover:text-white transition-colors`}>
                    Tate Chess Bot
                  </Link>
                </li>
                <li>
                  <Link href="https://www.aiimageandvideogenerators.xyz/" className={`${inter.className} text-slate-400 hover:text-white transition-colors`}>
                    AI Generators
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className={`${inter.className} text-slate-400 text-sm`}>
              © 2025 GenFoo. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <Link href="/privacy" className={`${inter.className} text-slate-400 hover:text-white transition-colors text-sm`}>
                Privacy Policy
              </Link>
              <Link href="/terms" className={`${inter.className} text-slate-400 hover:text-white transition-colors text-sm`}>
                Terms of Service
              </Link>
              <a href="mailto:blueparrottech@gmail.com" className={`${inter.className} text-slate-400 hover:text-white transition-colors text-sm`}>
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}