// src/components/themes/ticker/TickerTheme.tsx
"use client";

import { useChat, type Message } from '@ai-sdk/react';
import React, { useEffect, useRef, FormEvent, KeyboardEvent, useState, useMemo } from 'react';
import { SendIcon, Loader2, AlertTriangle, Zap } from "lucide-react";

// --- TickerDisplay Component (No changes needed here) ---
interface TickerDisplayProps {
  text: string;
  speed?: number;
}

const TickerDisplay: React.FC<TickerDisplayProps> = ({ text, speed = 20 }) => {
  const displayText = text || "Initializing AI Ticker...";

  return (
    <>
      <div className="ticker-wrap w-full overflow-hidden bg-gray-800 text-gray-100 py-3.5 shadow-lg select-none border-y-2 border-sky-500/30">
        <div
          className="ticker-move-disappear"
          style={{ animationDuration: `${speed}s` }}
        >
          <span className="ticker-item-single inline-block px-6 md:px-8 lg:px-12 py-1 whitespace-nowrap text-lg sm:text-xl md:text-2xl font-semibold text-sky-300 tracking-wider">
            {displayText}
          </span>
        </div>
      </div>
      <style jsx>{`
        .ticker-move-disappear {
          position: relative;
          left: 100%; 
          display: inline-block;
          white-space: nowrap;
          animation-name: scrollAndDisappear;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .ticker-move-disappear:hover {
          animation-play-state: paused;
        }
        @keyframes scrollAndDisappear {
          0% { transform: translateX(0%); }
          100% { transform: translateX(calc(-100% - 100vw)); }
        }
      `}</style>
    </>
  );
};

// --- TickerTheme Component ---
export default function TickerTheme() {
  const { messages, input, handleInputChange, handleSubmit: aiHandleSubmit, isLoading, error, setMessages } = useChat({
    api: "/api/chat",
    onError: (err) => {
      console.error("TickerTheme API error:", err);
    }
  });

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [dynamicAnimationDuration, setDynamicAnimationDuration] = useState<number>(20);

  const MIN_TICKER_DURATION = 15;
  const MAX_TICKER_DURATION = 120;
  const BASE_DURATION_OFFSET = 10;
  const SECONDS_PER_CHAR_FACTOR = 0.08;

  const latestAiMessageContent = useMemo(() => {
    const lastAiMsg = [...messages].reverse().find(m => m.role === 'assistant');
    return lastAiMsg ? lastAiMsg.content : "Welcome to AI Ticker! Ask me anything.";
  }, [messages]);

  const lastUserQuestion = useMemo(() => {
    return [...messages].reverse().find(m => m.role === 'user');
  }, [messages]);
  const lastUserQuestionContent = lastUserQuestion?.content || "";


  const displayTickerText = useMemo(() => {
    const lastMessageIsUser = messages.length > 0 && messages[messages.length - 1]?.role === 'user';
    if (isLoading && lastMessageIsUser) { // Check if loading and last message was by user
        return "AI is processing your request...";
    }
    return latestAiMessageContent;
  }, [isLoading, messages, latestAiMessageContent]);

  useEffect(() => {
    const textLength = displayTickerText.length;
    let calculatedDuration = BASE_DURATION_OFFSET + (textLength * SECONDS_PER_CHAR_FACTOR);
    calculatedDuration = Math.max(MIN_TICKER_DURATION, Math.min(MAX_TICKER_DURATION, calculatedDuration));
    setDynamicAnimationDuration(calculatedDuration);
  }, [displayTickerText]); // Removed constants from deps as they are stable

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const WELCOME_MSG_ID = 'welcome-msg-ticker';
  useEffect(() => {
    if (messages.length === 0 && !isLoading) {
        const welcomeMessage: Message = {
            id: WELCOME_MSG_ID,
            role: 'assistant',
            content: 'Welcome to AI Ticker Stream! Your AI responses will scroll here.',
            createdAt: new Date(),
        };
        setTimeout(() => setMessages([welcomeMessage]), 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || !input.trim()) return;
    aiHandleSubmit(e);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && input.trim()) {
      e.preventDefault();
      const syntheticEvent = {} as FormEvent<HTMLFormElement>;
      aiHandleSubmit(syntheticEvent);
    }
  };

  // Determine content for the "Your Query" box
  const getQueryBoxContent = () => {
    const isProcessingUserQuery = isLoading && lastUserQuestion && messages.length > 0 && messages[messages.length-1]?.id === lastUserQuestion.id;

    if (isProcessingUserQuery && lastUserQuestionContent) {
      return (
        <>
          <span className="font-semibold text-sky-500 mr-1.5">Processing:</span>
          <span className="text-gray-400 italic break-words">
            {lastUserQuestionContent.length > 80 ? lastUserQuestionContent.substring(0, 77) + "..." : lastUserQuestionContent}
          </span>
        </>
      );
    }
    
    if (lastUserQuestionContent && !isProcessingUserQuery) {
        // Check if this lastUserQuestion has an AI reply or if it's the absolute last message.
        // This avoids showing an old query if the latest AI message is unrelated or a welcome.
        const correspondingAiMessage = messages.find(m => m.role === 'assistant' && m.createdAt && lastUserQuestion?.createdAt && m.createdAt > lastUserQuestion.createdAt);
        const isLastOverallMessage = messages.length > 0 && messages[messages.length - 1]?.id === lastUserQuestion?.id;

        if(correspondingAiMessage || isLastOverallMessage || messages.length === 1 && lastUserQuestion){
             return (
                <>
                <span className="font-semibold text-sky-500 mr-1.5">Your query:</span>
                <span className="text-gray-300 break-words">
                    {lastUserQuestionContent}
                </span>
                </>
            );
        }
    }

    return <span className="text-gray-500 italic">Your query will appear here...</span>;
  };


  return (
    <div className="flex flex-col h-[100dvh] bg-gray-900 text-gray-100 font-sans antialiased">
      <header className="p-3.5 bg-gray-800/80 backdrop-blur-sm text-sky-400 text-center shadow-md sticky top-0 z-20 border-b border-gray-700/50 flex items-center justify-center space-x-2">
        <Zap className="w-5 h-5 text-sky-500" />
        <h1 className="text-lg font-semibold tracking-wide">AI Ticker Stream</h1>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* "Your Query" Section - Standardized Layout */}
        <div 
          className="mb-6 p-3 bg-gray-800/60 rounded-lg shadow-md text-sm max-w-2xl w-full text-center 
                     min-h-[56px] flex items-center justify-center flex-wrap" // min-h-14 (56px), flex-wrap for content
        >
          {getQueryBoxContent()}
        </div>

        <TickerDisplay
          text={displayTickerText}
          speed={dynamicAnimationDuration}
        />
        
        {isLoading && messages.length > 0 && messages[messages.length-1]?.role === 'user' && (
            <div className="mt-4 flex items-center text-sky-400 text-xs">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Thinking...</span>
            </div>
        )}
      </main>

      {error && (
        <div className="p-3 text-center text-sm text-red-400 bg-red-900/70 border-t-2 border-red-700/50 shrink-0 flex items-center justify-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span>Chat Error: {error.message || "An unexpected error occurred. Please try again."}</span>
        </div>
      )}

      <footer className="shrink-0 border-t-2 border-gray-700/50 p-3 sm:p-4 bg-gray-800/80 backdrop-blur-sm flex justify-center items-end shadow-top-dark">
        <form onSubmit={handleFormSubmit} className="flex items-end w-full max-w-xl">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder="Send a message to the AI Ticker..."
            className="flex-1 resize-none min-h-[50px] max-h-[150px] bg-gray-700/80 border border-gray-600/70 p-3 text-sm text-gray-200 placeholder-gray-400/90 rounded-l-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-150 scrollbar-thin scrollbar-thumb-gray-500/70 scrollbar-track-gray-700/50"
            rows={1}
            disabled={isLoading}
            aria-label="Chat input for AI Ticker"
          />
          <button
            type="submit"
            title="Send Message (Enter)"
            className="p-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-r-md disabled:opacity-50 disabled:cursor-not-allowed border border-l-0 border-sky-600 hover:border-sky-500 flex items-center justify-center h-[50px] w-[50px] sm:w-[60px] flex-shrink-0 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-sky-500"
            disabled={isLoading || !input.trim()}
          >
            {isLoading && messages.length > 0 && messages[messages.length -1]?.role === 'user' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <SendIcon className="h-5 w-5" />
            )}
          </button>
        </form>
      </footer>
    </div>
  );
}