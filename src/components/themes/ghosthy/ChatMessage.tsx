"use client"

import type { Message } from "ai"
import { useState, useEffect, useRef } from "react"
// No longer need GlitchText for this specific effect
// import { GlitchText } from "./GlitchText"
import { User, Bot, Ghost } from "lucide-react"

interface ChatMessageProps {
  message: Message
  glitchLevel: number
}

// --- Configuration Constants ---
// How long the message stays fully visible before disappearing (in milliseconds)
const VISIBLE_DURATION = 60 // 6 seconds (adjust as needed)
// How long the message stays hidden before re-typing (in milliseconds)
const HIDDEN_DURATION = 1500 // 1.5 seconds (adjust as needed)
// Base typing speed interval (in milliseconds)
const BASE_TYPING_SPEED = 15
// Random variation for typing speed
const RANDOM_TYPING_SPEED = 20
// --- End Configuration Constants ---


export function ChatMessage({ message, glitchLevel }: ChatMessageProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [isFullyTyped, setIsFullyTyped] = useState(false)
  const [isVisible, setIsVisible] = useState(true) // Controls if the text container is rendered
  const isUser = message.role === "user"

  // Refs to keep track of timers to clear them properly
  const visibleTimerRef = useRef<NodeJS.Timeout | null>(null)
  const hiddenTimerRef = useRef<NodeJS.Timeout | null>(null)
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // --- Effect 1: Typing Animation ---
  useEffect(() => {
    // Clear any previous typing interval if message changes or effect re-runs
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    if (isUser) {
      setDisplayedText(message.content)
      setIsFullyTyped(true)
      setIsVisible(true) // Ensure user message is always visible
      return
    }

    // Only start typing if the message is supposed to be visible
    // and hasn't finished typing yet.
    if (!isVisible || isFullyTyped) {
        // If it's not visible or already typed, ensure no interval runs
         if (typingIntervalRef.current) {
             clearInterval(typingIntervalRef.current);
         }
        return;
    }


    // Start fresh: reset text, mark as not fully typed
    setDisplayedText("")
    setIsFullyTyped(false) // Important: reset typing status

    const text = message.content
    let index = 0

    typingIntervalRef.current = setInterval(
      () => {
        if (index < text.length) {
          setDisplayedText((prev) => prev + text.charAt(index))
          index++
        } else {
          setIsFullyTyped(true)
          if (typingIntervalRef.current) {
             clearInterval(typingIntervalRef.current) // Stop typing interval
             typingIntervalRef.current = null;
          }
        }
      },
      BASE_TYPING_SPEED + Math.random() * RANDOM_TYPING_SPEED
    )

    // Cleanup function for the typing interval
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
        typingIntervalRef.current = null;
      }
    }
    // Dependencies: message content, user status, and VISIBILITY trigger
  }, [message.content, isUser, isVisible])

/* 
  // --- Effect 2: Visibility Cycle (Disappear & Reappear) ---
  useEffect(() => {
    // Clear previous cycle timers
    if (visibleTimerRef.current) clearTimeout(visibleTimerRef.current)
    if (hiddenTimerRef.current) clearTimeout(hiddenTimerRef.current)

    // Conditions to run the cycle: AI message, fully typed, high glitch level
    if (!isUser && isFullyTyped && glitchLevel > 7) {
      // Start timer to make message disappear
      visibleTimerRef.current = setTimeout(() => {
        setIsVisible(false) // Hide the message

        // After hiding, start timer to make it reappear (triggering re-type)
        hiddenTimerRef.current = setTimeout(() => {
          setIsVisible(true) // Show again (this will trigger typing effect)
          // isFullyTyped will be reset by the typing effect starting
        }, HIDDEN_DURATION)

      }, VISIBLE_DURATION)

    } else if (!isUser && glitchLevel <= 7) {
        // If glitch level drops, ensure message becomes and stays visible
        setIsVisible(true);
    }


    // Cleanup function for the visibility cycle timers
    return () => {
      if (visibleTimerRef.current) clearTimeout(visibleTimerRef.current)
      if (hiddenTimerRef.current) clearTimeout(hiddenTimerRef.current)
    }
    // Dependencies: Typing complete status, glitch level, user status, message ID (to restart cycle for new messages)
  }, [isFullyTyped, glitchLevel, isUser, message.id])
 */

  // Random message movement (remains the same)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  useEffect(() => {
    if (isUser || glitchLevel < 8) {
        // Reset position if glitch ends
        //  setPosition({ x: 0, y: 0});
        return;
    };

    const moveInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setPosition({
          x: Math.random() * 6 - 3,
          y: Math.random() * 6 - 3,
        })
      } else {
        // Occasionally reset position back slightly
         setPosition({
          x: Math.random() * 2 - 1,
          y: Math.random() * 2 - 1,
        })
      }
    }, 2000)

    return () => clearInterval(moveInterval)
  }, [ ])


  return (
    <div
      className={`mb-4 ${isUser ? "ml-auto" : "mr-auto"} max-w-[80%] transition-transform duration-500 ease-out`} // Smoother transition
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        // Add transition for opacity
        opacity: isVisible || isUser ? 1 : 0,
        transition: `opacity ${HIDDEN_DURATION / 2}ms ease-in-out, transform 500ms ease-out`,
      }}
    >
      <div className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* Icon logic remains the same */}
         <div
          className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${isUser ? "bg-green-500/20" : "bg-green-500/10"} transition-opacity duration-300`}
          style={{ opacity: isVisible || isUser ? 1 : 0 }} // Fade icon too
        >
          {isUser ? (
            <User size={16} className="text-green-500" />
          ) : glitchLevel > 6 ? (
            <Ghost size={16} className="text-green-300 animate-pulse" />
          ) : (
            <Bot size={16} className="text-green-300" />
          )}
        </div>

        {/* Only render the message bubble if visible (or user message) */}
        {(isVisible || isUser) && (
          <div
            className={`py-2 px-3 rounded-md ${
              isUser ? "bg-green-500/20 text-green-100" : "bg-black border border-green-500/30 text-green-400"
            } ${glitchLevel > 5 && !isUser ? "animate-subtle-shake" : ""}`}
          >
            {/* Render directly displayedText. No GlitchText needed here for disappearance effect. */}
            <div>
                {displayedText}
                {/* Show cursor only during typing for AI messages */}
                {!isUser && !isFullyTyped && <span className="inline-block w-2 h-4 bg-green-500 ml-1 animate-blink"></span>}
            </div>

 
          </div>
        )}
      </div>
    </div>
  )
}