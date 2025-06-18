// components/ChatMessage.tsx
"use client";

import { Message } from "ai"; // Import the Message type
import { useState, useEffect, useRef } from "react";

interface ChatMessageProps {
  message: Message;
  isLastMessage: boolean; // Is this the very last message in the list?
  isLoading: boolean; // Is the overall chat loading?
  cursorVisible: boolean; // State for the blinking cursor
}

// Adjust typing speed (milliseconds per character)
const TYPING_SPEED = 111; // Faster speed (e.g., 30ms) for a retro feel

export function ChatMessage({ message, isLastMessage, isLoading, cursorVisible }: ChatMessageProps) {
  const [displayedContent, setDisplayedContent] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to handle the typing animation for the last AI message
  useEffect(() => {
    // Clear any existing interval when message content or role changes
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only animate the last message if it's from the assistant/system
    if (message.role !== "user" && isLastMessage) {
       // Don't start animation until loading is actually false (stream has started)
       // OR if content already exists (e.g. page refresh with existing message)
      if (!isLoading || message.content.length > 0) {
        // Start from the beginning if displayedContent is empty,
        // otherwise, try to catch up if content grew faster than animation
        let charIndex = displayedContent.length;

        // Ensure charIndex doesn't exceed the actual content length
        if (charIndex >= message.content.length) {
             setDisplayedContent(message.content); // Instantly set if already caught up
             return; // No animation needed
        }


        intervalRef.current = setInterval(() => {
          setDisplayedContent((prev) => {
            // Make sure we don't go past the current actual content
            if (charIndex < message.content.length) {
              charIndex++;
              return message.content.substring(0, charIndex);
            } else {
              // Content fully displayed, clear interval
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              return prev;
            }
          });
        }, TYPING_SPEED);
      } else {
        // If it's the last AI message but still in the initial loading phase
        // before content arrives, show nothing yet (or just the prompt)
        setDisplayedContent("");
      }

    } else {
      // If it's a user message or a previous AI message, display instantly
      setDisplayedContent(message.content);
    }

    // Cleanup function to clear interval on unmount or dependency change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // Dependencies: message content, id (to re-run if message instance changes),
    // isLastMessage (to switch between animating/not animating), and isLoading (to gate animation start)
  }, [message.content, message.id, isLastMessage, isLoading]);

  // --- Rendering Logic ---
  const isAssistant = message.role !== "user";
  const showCursor = isAssistant && isLastMessage && isLoading && displayedContent.length === 0 || // Show cursor while waiting for the first chunk
                     isAssistant && isLastMessage && intervalRef.current !== null; // Show cursor while typing

  return (
    <div className="leading-relaxed ">
      <div className="text-[#5dfc70] opacity-70 mb-1 font-apple-ii">
        {message.role === "user" ? "] USER:" : "] SYSTEM:"}
      </div>
      <div className="text-[#5dfc70] font-apple-ii whitespace-pre-wrap "> {/* Use pre-wrap to respect newlines */}
        {displayedContent}
        {/* Show blinking cursor at the end of the line while typing or initially loading */}
        {showCursor && (
             <span className={`ml-1 ${cursorVisible ? "opacity-100" : "opacity-0"}`}>█</span>
        )}
      </div>
    </div>
  );
}