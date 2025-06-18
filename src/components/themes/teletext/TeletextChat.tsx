// components/themes/teletext/TeletextChat.tsx
"use client";

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from "react";
import { TeletextChatMessage } from './TeletextChatMessage'; // Import the themed message component

export default function TeletextChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat", // Ensure this API route exists and works
    onError: (err) => {
      console.error("Teletext Chat Error:", err);
      // Optionally display error to user in the Teletext style
    }
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // --- Clock State ---
  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  // --- End Clock State ---


  // Auto-scroll to bottom
  useEffect(() => {
    // Use timeout to ensure scrolling happens after potential DOM updates/typing effect
    const timer = setTimeout(() => {
      if (chatContainerRef.current) {
         chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100); // Adjust timing if needed

    return () => clearTimeout(timer);
  }, [messages, isLoading]); // Trigger on messages and loading state

   // Display error message if any
   useEffect(() => {
    if (error) {
        // You could potentially add a message to the `messages` state here
        // This is a simple alert for now
        alert(`Chat Error: ${error.message}`);
    }
   }, [error]);


  return (
    // Main container with black background and Teletext font
    <div className="flex flex-col h-screen bg-teletext-black font-teletext text-teletext-white p-2 md:p-4">

      {/* Header - Mimics Teletext Header */}
      <div className="flex justify-between items-center border-b-2 border-teletext-cyan pb-1 mb-2 px-1">
        <span className="text-teletext-yellow text-lg">P100 CEEFAX 1</span> {/* Example Page/Channel */}
        <span className="text-teletext-cyan text-lg">{currentTime}</span>   {/* Live Clock */}
      </div>

      {/* Messages Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto mb-4 px-1">
        {messages.length === 0 && !isLoading && !error ? (
          <div className="text-teletext-green opacity-80 mt-10 text-center">
            <p>PAGE 101</p>
            <p className="mt-4">AI CHAT READY</p>
            <p className="mt-2">TYPE BELOW...</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <TeletextChatMessage
              key={message.id}
              message={message}
              isLastMessage={index === messages.length - 1}
              isLoading={isLoading}
            />
          ))
        )}
         {/* This div helps ensure scrolling happens to the very bottom */}
         <div ref={messagesEndRef} />
      </div>


      {/* Input Area */}
      <div className="border-t-2 border-teletext-cyan pt-2 mt-auto px-1">
        <form onSubmit={handleSubmit} className="flex items-center">
          {/* Simple prompt indicator */}
          <span className="text-teletext-yellow mr-2 text-lg">{'>'}</span>
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="" // Teletext usually didn't have placeholders
            className="flex-1 bg-transparent border-none outline-none text-teletext-white placeholder-teletext-white placeholder-opacity-50 font-teletext text-sm md:text-base uppercase caret-teletext-white" // Basic styling, uppercase often used
            autoFocus
            disabled={isLoading}
            spellCheck="false" // Disable spellcheck for retro feel
          />
           {/* Simple blinking cursor for input */}
           {!isLoading && <span className="ml-1 inline-block w-[1ch] h-[1.2em] bg-teletext-white animate-blink"></span>}

          {/* Optional: Hide submit button, rely on Enter key */}
          {/* <button type="submit" disabled={isLoading || !input} className="hidden">Send</button> */}
        </form>
      </div>
    </div>
  );
}

// Add basic blink animation directly in CSS if not using Tailwind animation plugin
// You might need to add this to your global CSS file (e.g., globals.css)
/*
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.animate-blink {
  animation: blink 1s step-end infinite;
}
*/