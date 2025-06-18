//  \src\components\themes\paper\page.tsx
"use client";

import { useChat, Message } from '@ai-sdk/react';
import React, { useEffect, useRef, FormEvent, KeyboardEvent } from "react";
import { Loader2, SendIcon } from 'lucide-react';
import { Homemade_Apple } from "next/font/google";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const appleFont = Homemade_Apple({
  subsets: ["latin"],
  weight: "400",
});

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    onError: (err) => {
      console.error("Chat API error:", err);
    }
  });

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // --- Scroll Logic: Scroll to bottom only on user message (matches example) ---
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Check if there are messages and the *very last* one is from the user
    const shouldScroll = messages.length > 0 && messages[messages.length - 1].role === 'user';

    if (shouldScroll) {
        // Use a small timeout to allow the DOM to update and calculate the new scrollHeight correctly
        const timer = setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 0); // Pushes execution to the end of the event loop queue
        
        return () => clearTimeout(timer); // Cleanup timeout
    }
    // No scrolling needed if the last message was not from the user
  }, [messages]); // Depend directly and ONLY on the messages array

  // --- Focus input (matches example dependencies) ---
  useEffect(() => {
    // Only focus if not loading AND there is no error.
    if (!isLoading && !error) {
      inputRef.current?.focus();
    }
  }, [isLoading, error]); // Dependencies are isLoading and error

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || isLoading) return;
    handleSubmit(event);
  };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !isLoading && input.trim()) {
            e.preventDefault(); // Prevent default newline
            handleSubmit({} as FormEvent<HTMLFormElement>); // Pass dummy event
        }
    };

  const MessageLineRenderer: React.FC<{ textContent: string; role: 'user' | 'assistant' }> = ({ textContent, role }) => {
    const isUser = role === 'user';
    const lineBaseClass = "relative py-2 flex items-center border-b border-[#a0cff2] min-h-[3rem]";
    const alignmentClass = isUser ? 'justify-end' : 'justify-start';
    const textContainerClass = isUser
      ? `text-blue-700 mr-4 text-right ml-12 ${appleFont.className}`
      : `text-[#4a488a] ml-12 ${appleFont.className}`;

    return (
      <div className={`${lineBaseClass} ${alignmentClass}`}>
        {!isUser && <div className="absolute left-0 top-0 bottom-0 w-px bg-pink-400 opacity-70 ml-8"></div>}
        <div className={`w-full max-w-full break-words whitespace-pre-wrap ${textContainerClass}`}>
          {isUser ? (
            textContent || ' '
          ) : (
            <div className="prose prose-sm prose-notebook max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ node, ...props }) => <p className="my-0.5" {...props} />,
                }}
              >
                {textContent || ' '}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`h-[100dvh] flex flex-col bg-[#f5f5dc] ${appleFont.className}`}>
      <div className="flex-1 flex flex-col items-center overflow-hidden    pt-20 pb-4">
        <div className="flex-1 flex flex-col w-full max-w-2xl lg:max-w-4xl bg-white shadow-lg rounded-sm overflow-hidden min-h-0">
          <div
            ref={messagesContainerRef}
            className={`flex-1 overflow-y-auto px-4 sm:px-6  text-2xl`}
            style={{
              backgroundImage: `url('https://www.transparenttextures.com/patterns/paper.png')`,
              backgroundRepeat: 'repeat',
              backgroundSize: 'auto',
            }}
          >
            {messages.map((message) => {
               const contentLines = message.content.split('\n');
               return contentLines.map((line, index) => (
                 <MessageLineRenderer
                   key={`${message.id}-line-${index}`}
                   textContent={line}
                   role={message.role as 'user' | 'assistant'}
                 />
               ));
            })}

            {isLoading && (messages.length === 0 || messages[messages.length - 1]?.role === 'user') && (
              <MessageLineRenderer textContent="Writing..." role="assistant" />
            )}
            <div className="h-1"></div> {/* Scroll helper */}
          </div>
        </div>
      </div>

      {error && (
        <div className="w-full max-w-2xl lg:max-w-3xl mx-auto p-2 my-1 text-center text-xs text-red-700 bg-red-100 border border-red-300 rounded-sm">
           Error: {error.message || "An unexpected error occurred."}
       </div>
     )}

      <div className="w-full max-w-2xl lg:max-w-3xl mx-auto border-t border-gray-300 rounded-sm bg-white/90 backdrop-blur-sm p-3">
        <form
          onSubmit={handleFormSubmit}
          className="flex items-end gap-3 w-full"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className={`flex-1 resize-none min-h-[60px] max-h-[180px] bg-gray-100 border border-gray-400 rounded-md p-2.5 focus:ring-1 focus:ring-red-500 focus:outline-none text-base custom-scrollbar ${appleFont.className}`}
            rows={2}
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            title="Send (Enter)"
            className="p-2 bg-[#FF715C] hover:bg-red-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-[60px] w-[60px] flex-shrink-0"
            disabled={isLoading || !input.trim()}
          >
            {isLoading && (!messages.length || messages[messages.length - 1].role === 'user') ? <Loader2 className="h-6 w-6 animate-spin" /> : <SendIcon className="h-6 w-6" />}
          </button>
        </form>
      </div>
    </div>
  );
}

/*
 globals.css content remains the same
*/