// src/components/themes/rpg/page.tsx
"use client";

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef } from "react";
import RpgChatMessage from './RpgChatMessage';
import RpgChatInput from './RpgChatInput';

export default function RpgThemePage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat", // Your backend API endpoint
    // Optional: Initial message or other useChat options
    // initialMessages: [
    //   { id: '0', role: 'system', content: 'Welcome adventurer! What quest brings you here?' }
    // ]
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // Fallback scroll for reliability
     const timer = setTimeout(() => {
       if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
       }
    }, 150); // Give rendering a moment
     return () => clearTimeout(timer);
  }, [messages, isLoading]); // Trigger on messages and loading state

  return (
    // Main container for the RPG theme - full screen, black background
    <div className="flex flex-col h-screen bg-rpg-bg font-rpg text-rpg-text p-4 sm:p-6 md:p-8">
      {/* Chat messages area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-rpg-border scrollbar-track-rpg-blue">
        {messages.map((message, index) => (
          <RpgChatMessage
            key={message.id}
            message={message}
            isLastMessage={index === messages.length - 1}
            isLoading={isLoading}
          />
        ))}
        {/* Element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <RpgChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}