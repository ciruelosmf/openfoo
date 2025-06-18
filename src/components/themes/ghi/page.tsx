// src/components/themes/ghibli/page.tsx
'use client';

import React, { useEffect, useRef, FormEvent, KeyboardEvent } from 'react';
import { useChat, Message } from 'ai/react'; // Message type can be explicitly used
import { Loader2, SendIcon } from 'lucide-react'; // Keep lucide for icons
import { Inter, Space_Grotesk, Teko, Public_Sans } from "next/font/google";

const tekoFont = Teko({
  subsets: ["latin"],
  weight: "600", // Using a slightly bolder weight for Teko for more impact
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const publicFont = Public_Sans({
  subsets: ["latin"],
  weight: "400",
});
export default function GhibliThemePage() {
    const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
        api: "/api/chat",
        onError: (err) => {
            console.error("Chat API error:", err);
            // You could add a custom message to the state here if needed
            // setMessages([...messages, { id: 'error-' + Date.now(), role: 'system', content: `Error: ${err.message}` }]);
        }
    });

    const scrollContainerRef = useRef<HTMLDivElement>(null); // Ref for the div that will scroll
    const inputRef = useRef<HTMLTextAreaElement>(null);

 // --- Scroll Logic ---
 useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Check if there are messages and the *very last* one is from the user
    const shouldScroll = messages.length > 0 && messages[messages.length - 1].role === 'user';

    if (shouldScroll) {
        // Use a small timeout to allow the DOM to update and calculate the new scrollHeight correctly
        const timer = setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 0); // Pushes execution to the end of the event loop queue

        // Cleanup function to clear the timeout if the component unmounts
        // or if messages change again before the timeout fires
        return () => clearTimeout(timer);
    }
    // No scrolling needed if the last message was not from the user
}, [messages]); // Depend directly on the messages array
    

    // --- Focus input ---
    useEffect(() => {
        if (!isLoading && !error) {
            inputRef.current?.focus();
        }
    }, [isLoading, error]);

    // Handle submission via Enter key (Shift+Enter for newline)
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !isLoading && input.trim()) {
            e.preventDefault(); // Prevent default newline
            handleSubmit({} as FormEvent<HTMLFormElement>); // Pass dummy event
        }
    };

    // Wrapper for handleSubmit to ensure it's used in a form context if needed
    const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isLoading && input.trim()) {
           handleSubmit(e);
        }
    };

    return (
        // TooltipProvider removed as we are not using shadcn tooltips
        // Main container - Ensure height and flex direction
        <div className="relative flex flex-col h-screen bg-orange-200 bg-[url('/house.webp')] bg-cover bg-center bg-fixed">

            {/* Texture Overlay - Uses inline styles, no UI lib needed */}
            <div
                style={{
                    opacity: 0.12, mixBlendMode: 'multiply', zIndex: 100,
                    pointerEvents: 'none', backgroundImage: 'url(./texture.jpg)',
                    backgroundRepeat: 'repeat', backgroundSize: 'cover',
                    position: 'fixed', inset: 0, isolation: 'isolate',
                }}
                aria-hidden="true"
            />

            {/* Chat Wrapper - Takes remaining space, allows inner scroll */}
            {/* Padding applied here for overall spacing */}
            <div className="relative z-10 flex flex-1 flex-col   overflow-hidden p-4 md:p-6 lg:p-8 mt-16">

                {/* Scrollable Message Area - Standard div with overflow */}
                <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto mb-4 pr-2 space-y-4  " // Added pr-2 for scrollbar spacing
                    // Basic scrollbar styling (won't work in Firefox without prefixes/more CSS)
                    style={{ scrollbarWidth: 'thin' }} // For Firefox
                    // className="... [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-green-300 [&::-webkit-scrollbar-track]:bg-green-100/50 [&::-webkit-scrollbar-thumb]:rounded-full" // Optional Webkit scrollbar styling
                >
                    {messages.map((message: Message) => ( // Use Message type from 'ai/react'
                        <div
                            key={message.id}
                            className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {/* AI Avatar - Simple div + img */}
                            {message.role === 'assistant' && (
                                <div
                                  className=" "
                                  title="Assistant" // Basic tooltip
                                >
                          
                                </div>
                            )}

                            {/* Message Bubble - Simple div */}
                            <div
                                className={` ${publicFont.className}    max-w-[55%] xl:max-w-[34%] rounded-sm border-2 border-b-6  border-yellow-800/60  px-3 py-2 shadow-md text-sm md:text-base ${message.role === 'user'
                                        ? 'bg-green-200 text-green-900' // User message style
                                        : 'bg-orange-100 backdrop-blur-sm text-gray-800' // AI message style
                                    }`}
                            >
                                <p className="whitespace-pre-wrap ">{message.content}</p>
                            </div>

                            {/* User Avatar - Simple div + img */}
                            {message.role === 'user' && (
                               <div
                                  className=" "
                                  title="You" // Basic tooltip
                                >
                                
                                </div>
                            )}
                        </div>
                    ))}
                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="flex justify-start items-center gap-2 text-gray-600 pl-10"> {/* Match AI indent */}
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className={` ${publicFont.className} px-2 text-lg italic bg-green-100 text-green-800 rounded-sm border-1    border-yellow-800/60`}>Assistant is typing...</span>
                        </div>
                    )}
                    {/* Error Display */}
                    {error && (
                        <div className="flex justify-start items-center bg-red-100 w-122 gap-2 p-4 font-base text-red-700 pl-10 font-medium text-sm">
                           Error: {error.message}
                        </div>
                    )}
                </div>

                {/* Input Form - Standard form element */}
                <form
                    onSubmit={handleFormSubmit}
                    className="flex w-full items-center m-auto gap-2 rounded-lg  max-w-[650px] bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-2 shadow-md border border-gray-300/50 dark:border-gray-700/50"
                >
                    {/* Textarea - Standard textarea element */}
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask something..."
                        className="flex-1 resize-none min-h-[70px] max-h-[150px]   bg-transparent border-none focus:ring-0 focus:outline-none p-2 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        rows={1}
                        disabled={isLoading}
                    />
                    {/* Button - Standard button element */}
                    <button
                        type="submit"
                        title="Send Message (Enter)" // Basic tooltip
                        className="flex-shrink-0 p-2 rounded-full text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        disabled={isLoading || !input.trim()}
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendIcon className="h-5 w-5" />}
                    </button>
                </form>
            </div> {/* End Chat Wrapper */}
        </div> // End Main Container
    );
}