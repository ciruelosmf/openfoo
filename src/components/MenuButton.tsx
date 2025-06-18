// src/components/common/MenuButton.tsx
'use client'; // This component needs client-side interactivity

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image'; // If using an image for profile
import Link from 'next/link';

// Placeholder user info - replace with actual data fetching later
const userInfo = {
    name: 'User Name',
    // Replace with actual path to user's profile picture if available
    profilePictureUrl: '/placeholder-user.png', // Add a placeholder image to public/
};

const MenuButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null); // Ref for detecting clicks outside

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        // Cleanup listener on component unmount or when menu closes
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div ref={menuRef} className="relative">
            {/* --- The Button --- */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white hover:opacity-80 transition-opacity" // Added subtle focus/hover
                aria-haspopup="true"
                aria-expanded={isOpen}
                title="User Menu" // Accessibility
            >
                {/* Use an Image or an Icon */}
                {userInfo.profilePictureUrl ? (
                    <Image
                        src={userInfo.profilePictureUrl}
                        alt="User Profile"
                        width={28} // Adjust size as needed (e.g., 28px)
                        height={28}
                        className="rounded-full object-cover" // Make image circular
                    />
                ) : (
                    // Fallback Icon/Text if no image
                    <span className="inline-block h-7 w-7 overflow-hidden rounded-full bg-gray-600 text-white flex items-center justify-center text-xs">
                        {/* Simple placeholder like initials or an icon */}
                        {userInfo.name ? userInfo.name.substring(0, 1) : '?'}
                        {/* Or use an SVG icon here */}
                    </span>
                )}
            </button>

            {/* --- The Dropdown Menu --- */}
            {isOpen && (
                <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-gray-900 text-gray-200 ring-1 ring-black ring-opacity-5 focus:outline-none z-50" // Increased z-index
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button" // Needs an id on the button if using this
                >
                    {/* Menu Header (Optional) */}
                    <div className="px-4 py-2 border-b border-gray-700">
                        <p className="text-sm font-medium">Signed in as</p>
                        <p className="text-sm truncate">{userInfo.name}</p>
                    </div>

                    {/* Menu Items */}
                    <Link href="/" passHref legacyBehavior>
                        <a
                             role="menuitem"
                             className="block px-4 py-2 text-sm hover:bg-gray-700 w-full text-left"
                             onClick={() => setIsOpen(false)} // Close menu on click
                        >
                            Homepage
                        </a>
                    </Link>
                    <Link href="/account-settings" passHref legacyBehavior>
                         <a
                             role="menuitem"
                             className="block px-4 py-2 text-sm hover:bg-gray-700 w-full text-left"
                             onClick={() => setIsOpen(false)} // Close menu on click
                        >
                            Account Settings
                        </a>
                    </Link>
                    {/* Add more placeholder options */}
                    <button
                        role="menuitem"
                        className="block px-4 py-2 text-sm hover:bg-gray-700 w-full text-left"
                        onClick={() => { alert('Option 1 Clicked!'); setIsOpen(false); }}
                    >
                        Placeholder Option 1
                    </button>
                    <button
                        role="menuitem"
                        className="block px-4 py-2 text-sm hover:bg-gray-700 w-full text-left"
                        onClick={() => { alert('Logout Clicked!'); setIsOpen(false); }} // Example action
                    >
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
};

export default MenuButton;