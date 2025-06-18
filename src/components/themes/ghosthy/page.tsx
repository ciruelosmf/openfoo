// src/components/themes/gho/GhoTheme.tsx
"use client";

import { useChat, type Message } from '@ai-sdk/react';
import React, { useEffect, useRef, useState, FormEvent, KeyboardEvent, useMemo } from 'react';
import { ChatMessage } from "./ChatMessage";
import { PowerButton } from "./PowerButton";
import { GlitchText } from "./GlitchText";
import { Loader2, Ghost, SendIcon } from "lucide-react";

interface QAPair {
    id: string;
    userQuestion: Message;
    aiReply: Message | null;
}

export default function GhoTheme() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    onError: (err) => {
        console.error("Ghosty Chat API error:", err);
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [powerOn, setPowerOn] = useState(true);
  const [glitchLevel, setGlitchLevel] = useState(0);

  // Ref to store scroll position before keyboard opens
  const scrollPositionBeforeKeyboard = useRef<number | null>(null);
  // Ref to track if the keyboard interaction is currently being handled
  const isHandlingKeyboardScroll = useRef(false);

  const qaPairs: QAPair[] = useMemo(() => {
    const pairs: QAPair[] = [];
    messages.forEach((msg, index) => {
        if (msg.role === 'user') {
            let currentAiReply: Message | null = null;
            if (index + 1 < messages.length && messages[index + 1].role === 'assistant') {
                currentAiReply = messages[index + 1];
            }
            pairs.push({
                id: msg.id,
                userQuestion: msg,
                aiReply: currentAiReply,
            });
        }
    });
    return pairs;
  }, [messages]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 800);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    if (!powerOn) {
      document.body.classList.remove("screen-flicker");
      return;
    }
    const glitchInterval = setInterval(() => {
      setGlitchLevel(Math.floor(Math.random() * 10));
      if (Math.random() > 0.95) {
        document.body.classList.add("screen-flicker");
        setTimeout(() => document.body.classList.remove("screen-flicker"), 150);
      }
    }, 3000);
    return () => {
      clearInterval(glitchInterval);
      document.body.classList.remove("screen-flicker");
    };
  }, [powerOn]);

  // Scroll to bottom when NEW messages change, UNLESS we are handling keyboard scroll
  useEffect(() => {
    if (isHandlingKeyboardScroll.current) return; // Don't scroll if keyboard just opened

    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (powerOn && inputRef.current) {
        inputRef.current.focus();
    }
  }, [powerOn]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = 0;
    }
  }, []);

  const ghostStyles = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDuration: `${10 + Math.random() * 10}s`,
        animationDelay: `${i * 2}s`,
        opacity: 0.1 + Math.random() * 0.1,
        transform: `scale(${0.5 + Math.random()})`,
    }));
  }, []);

  const handleActualFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!powerOn || isLoading || !input.trim()) return;
    handleSubmit(e);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && input.trim() && powerOn) {
        e.preventDefault();
        handleSubmit({} as FormEvent<HTMLFormElement>);
    }
  };

  // **NEW**: Handle input focus to manage scroll with keyboard
  const handleInputFocus = () => {
    if (chatContainerRef.current) {
      // Store the current scroll position
      scrollPositionBeforeKeyboard.current = chatContainerRef.current.scrollTop;
      isHandlingKeyboardScroll.current = true;

      // After a short delay (to allow keyboard to open and layout to shift)
      // try to restore the scroll position.
      // Using requestAnimationFrame is often smoother than setTimeout(0) for layout changes.
      requestAnimationFrame(() => {
        if (chatContainerRef.current && scrollPositionBeforeKeyboard.current !== null) {
          // Check if the user was scrolled significantly away from the bottom
          // A small threshold helps avoid restoring if they were already near the bottom
          const { scrollHeight, clientHeight } = chatContainerRef.current;
          const isScrolledUp = scrollHeight - scrollPositionBeforeKeyboard.current - clientHeight > 100; // e.g. 100px from bottom

          // Only restore if they were scrolled up. If they were at the bottom,
          // let the default behavior (or new message scroll) handle it.
          if (isScrolledUp) {
            chatContainerRef.current.scrollTop = scrollPositionBeforeKeyboard.current;
          }
        }
        // Reset the flag after a bit longer to ensure message scroll effect isn't immediately triggered
        setTimeout(() => {
            isHandlingKeyboardScroll.current = false;
            scrollPositionBeforeKeyboard.current = null; // Clear stored position
        }, 100); // Adjust delay if needed
      });
    }
  };

  // **NEW**: Handle input blur to reset the keyboard handling flag
  const handleInputBlur = () => {
    // It's generally good practice to reset flags on blur, though the timeout in focus might be enough.
    // isHandlingKeyboardScroll.current = false; // Covered by timeout in handleInputFocus
    // scrollPositionBeforeKeyboard.current = null;
  };


  if (!powerOn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-500">
        <div className="mb-8">
          <GlitchText text="TERMINAL OFFLINE" className="text-4xl font-mono" />
        </div>
        <PowerButton onClick={() => setPowerOn(true)} />
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-[100dvh] bg-black text-green-500 font-mono relative overflow-hidden ${glitchLevel > 7 ? "glitch-high" : glitchLevel > 4 ? "glitch-medium" : "glitch-low"}`}
    >
      {/* ... (ghosts and header) ... */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {ghostStyles.map((style, i) => (
          <Ghost
            key={i}
            className="absolute text-green-500/10 animate-float"
            style={style}
          />
        ))}
      </div>

      <header className="h-[78px] border-b border-green-500/30 p-4 flex justify-between items-center shrink-0">
 
      </header>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-green-500/50 scrollbar-track-black/50"
        style={{
          backgroundImage: "radial-gradient(circle at center, rgba(0, 40, 0, 0.2) 0%, transparent 70%)",
        }}
      >
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && !isLoading && (
            <div className="text-center my-12 animate-flicker">
              <GlitchText text="AWAITING INPUT..." className="text-2xl mb-4" />
              <p className="text-sm text-green-500/70">The veil is thin... speak.</p>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} glitchLevel={message.role === "assistant" ? glitchLevel : 0} />
          ))}

          {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
            <div className="flex items-center text-green-400/70 my-4 pl-2 animate-pulse">
              <span className="mr-2 text-xs">GHOST_CHANNELLING</span>
              <span className="text-xs">▋</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {error && (
            <div className="p-2 text-center text-xs text-red-400 border-t border-red-500/50 shrink-0">
                Connection unstable: {error.message || "An unknown error occurred."}
            </div>
      )}

      <div className="border-t flex items-center border-green-500/50 p-3 shrink-0 bg-black">
          <div className="flex-1 flex justify-center">
              <form
                  onSubmit={handleActualFormSubmit}
                  className="flex items-end gap-3 w-full max-w-2xl"
              >
                  <textarea
                      ref={inputRef}
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleInputKeyDown}
                      onFocus={handleInputFocus} // ** ADDED **
                      onBlur={handleInputBlur}   // ** ADDED (optional but good practice) **
                      placeholder={powerOn ? "Type your message into the ectonet..." : "SYSTEM OFFLINE"}
                      className="flex-1 resize-none min-h-[60px] max-h-[180px] bg-black/50 border border-green-500/70 rounded-sm p-2.5 focus:ring-1 focus:ring-green-500 focus:outline-none text-sm text-green-400 placeholder-green-600/70 scrollbar-thin scrollbar-thumb-green-500/50 scrollbar-track-black/50"
                      rows={1}
                      disabled={isLoading || !powerOn}
                      aria-label="Chat input"
                  />
                        <button
                            type="submit"
                            title="Send (Enter)"
                            className="p-2 bg-slate-800 hover:bg-red-400 text-white rounded-sm disabled:opacity-50 disabled:cursor-not-allowed border-red-400  flex items-center justify-center h-[60px] w-[60px] flex-shrink-0"
                            disabled={isLoading || !input.trim()}
                        >
                            {isLoading && (!messages.length || messages[messages.length - 1].role === 'user') ? <Loader2 className="h-6 w-6 animate-spin" /> : <SendIcon className="h-6 w-6" />}
                        </button>
              </form>
          </div>
      </div>

      <div className="scanlines absolute inset-0 pointer-events-none"></div>
      <div className="crt-effect absolute inset-0 pointer-events-none"></div>
    </div>
  );
}