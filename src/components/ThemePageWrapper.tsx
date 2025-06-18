// src/components/ThemePageWrapper.tsx
"use client";


import React, { useState, useEffect} from 'react';
import { useRouter  } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
// Remove the static Avatar imports if UserButton fully replaces it
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, MessageSquarePlus, Menu, CreditCard, AlertCircle, Loader2 } from 'lucide-react';

// Import Clerk components
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";

interface ThemePageWrapperProps {
  children: React.ReactNode;
}

export default function ThemePageWrapper({ children }: ThemePageWrapperProps) {
  const router = useRouter();
 
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState<boolean>(true);
  const [creditsError, setCreditsError] = useState<string | null>(null);

  // --- Fetch Credits ---
  useEffect(() => {
    const fetchCredits = async () => {
      // Only fetch credits if the user is signed in (optional, but good practice)
      // You might need to get the userId or session status from Clerk here if your API requires it
      // For now, let's assume it fetches based on the session cookie
      setIsLoadingCredits(true);
      setCreditsError(null);
      try {
        const response = await fetch('/api/credits');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCredits(data.credits);
      } catch (error: any) {
        console.error("Failed to fetch credits:", error);
        setCreditsError(error.message || "Could not load credits.");
      } finally {
        setIsLoadingCredits(false);
      }
    };

    // Consider fetching credits only when the component mounts or when auth state changes
    // For simplicity, keeping the original logic, but you might want to tie this to Clerk's auth state.
     //  fetchCredits();  
  }, []);

  const handleNewChat = () => {
router.refresh()
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="theme-page-container  relative">
      {children}
      <div   style={{
    borderRadius: '11px',    // camelCase for CSS properties like border-radius
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 100,             // z-index can be a number or a string
    backgroundColor: '#FF715C' // camelCase for background-color, value is a string
  }}>
        <Drawer direction="left">
          <DrawerTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4 " />
              <span className="sr-only ">Open Menu</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="w-[250px] h-full flex flex-col">
            <DrawerHeader className="p-4 border-b">
              <DrawerTitle className="text-center">OpenFoo</DrawerTitle>
            </DrawerHeader>

            <div className="flex flex-col items-center p-4 space-y-3 flex-grow"> {/* Adjusted space-y */}
              {/* --- Clerk User Button / Sign In/Up --- */}
              <SignedIn>
                <div className="mb-4 w-full flex justify-center">
                  <UserButton
                    afterSignOutUrl="/" // Redirect to home page after sign out
                    appearance={{
                      elements: {
                        avatarBox: "w-20 h-20", // Make avatar larger if desired
                      }
                    }}
                  />
                </div>
              </SignedIn>
              <SignedOut>
                <div className="flex flex-col space-y-2 w-full items-center mb-4">
                  {/* You can use Clerk's buttons directly or wrap your own */}
                  <SignInButton mode="modal">
                    <Button variant="outline" className="w-full max-w-[180px]">Login</Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button variant="default" className="w-full max-w-[180px]">Sign Up</Button>
                  </SignUpButton>
                </div>
              </SignedOut>
              {/* --- End Clerk User Button --- */}


              <DrawerClose asChild>
                <Button variant="ghost" className="w-full justify-start" onClick={handleNewChat}>
                  <MessageSquarePlus className="mr-2 h-4 w-4" />
                  New Chat
                </Button>
              </DrawerClose>

              <DrawerClose asChild>
                <Button variant="ghost" className="w-full justify-start" onClick={handleGoHome}>
                  <Home className="mr-2 h-4 w-4" />
                  Homepage
                </Button>
              </DrawerClose>

              {/* --- Credits Display --- */}
              {/* Show credits only if signed in, as credits are user-specific */}
              <SignedIn>
 
              </SignedIn>
              {/* --- End Credits Display --- */}
            </div>

            {/* Optional: Add a sign out button explicitly if UserButton isn't enough,
                but UserButton already contains sign out functionality.
            <SignedIn>
              <div className="p-4 border-t">
                <SignOutButton>
                  <Button variant="outline" className="w-full">Sign Out</Button>
                </SignOutButton>
              </div>
            </SignedIn>
            */}
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}