// src/components/themes/star_wars/StarWarsThemeSingleFile.tsx
"use client";

import { useChat, type Message } from '@ai-sdk/react';
import React, { useEffect, useRef, FormEvent, KeyboardEvent, useState, useMemo } from 'react';
// Assuming lucide-react is available in the project
import { SendIcon, Loader2, AlertTriangle, UserCircle2 } from "lucide-react";

// --- StarWarsScroll Component (Internal) ---
interface StarWarsScrollProps {
  text: string;
  animationKey: string | number; // To re-trigger animation
  title?: string; // Optional title for the crawl
}

const StarWarsScroll: React.FC<StarWarsScrollProps> = ({ text, animationKey, title }) => {
  if (!text && !title) { // Show placeholder only if both text and title are empty
    return (
      <>
        <div className="star-wars-outer-container">
          {/* Placeholder or empty state can be styled here if needed */}
        </div>
        <style jsx>{`
          .star-wars-outer-container {
            width: 100%;
            height: 100%; /* Ensure it fills its allocated space */
            background-color: transparent; /* Or a very subtle placeholder pattern */
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(255, 232, 31, 0.3); /* Dim yellow for placeholder text */
            font-family: 'Pathway Gothic One', sans-serif;
            font-size: 1.5rem;
          }
        `}</style>
      </>
    );
  }

  // Split text into paragraphs for better Star Wars crawl readability
  const paragraphs = text.split('\n').filter(p => p.trim() !== '');
  const hasContent = title || paragraphs.length > 0;

  // Estimate animation duration based on content length (simple approach)
  // Roughly 15 seconds base + 0.2 seconds per word
  const wordCount = (title?.split(/\s+/).length || 0) + text.split(/\s+/).length;
  const estimatedDuration = Math.max(20, Math.min(90, 15 + wordCount * 0.15)); // Min 20s, Max 90s

  return (
    <>
      <div className="star-wars-outer-container">
        <div className="star-wars-perspective-container">
          {hasContent && (
            <div
              key={animationKey}
              className="star-wars-crawl-content"
              style={{ animationDuration: `${estimatedDuration}s` }}
            >
              {title && <h2 className="crawl-title">{title}</h2>}
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="crawl-paragraph">{paragraph}</p>
              ))}
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .star-wars-outer-container {
          width: 100%;
          height: 100%; /* Takes full height of its parent (.ai-reply-container) */
          background-color: #000000; /* Black background for the scroll area */
          overflow: hidden; /* Crucial: clips the content that moves out of perspective */
          display: flex; /* For centering perspective container */
          justify-content: center;
          align-items: flex-end; /* Aligns perspective container to the bottom */
        }
        .star-wars-perspective-container {
          perspective: 380px; /* Adjust for desired 3D intensity. Higher value = less intense. */
          perspective-origin: 50% 0%; /* Perspective origin at top center of this container */
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: flex-end; /* Text starts from the bottom of this container */
        }
        .star-wars-crawl-content {
          position: relative;
          width: 90%;
          max-width: 600px; /* Max width for readability */
          text-align: justify;
          transform-origin: 50% 100%; /* Rotate around bottom center */
          animation-name: starWarsCrawlAnimation;
          animation-timing-function: linear;
          animation-fill-mode: forwards; /* Keeps final state (disappeared) */
          font-family: 'Pathway Gothic One', sans-serif;
          color: #FFE81F; /* star-wars-yellow */
          font-size: clamp(1.75rem, 4.5vw, 2.8rem); /* Responsive font size */
          line-height: 1.4;
          padding: 0 1rem; /* Some padding for very narrow screens */
        }
        .crawl-title {
          text-align: center;
          font-size: 1.2em; /* Relative to crawl content font size */
          font-weight: bold; /* 'Pathway Gothic One' is thin, so bold helps */
          margin-bottom: 2em;
          text-transform: uppercase;
        }
        .crawl-paragraph {
          margin-bottom: 1.5em;
        }

        @keyframes starWarsCrawlAnimation {
          0% {
            transform: rotateX(22deg) translateY(100%); /* Start off-screen at bottom, slightly more tilt */
            opacity: 1;
          }
          /* Optional: Fade in more gradually
          5% {
             opacity: 1;
          } */
          85% { /* Start fading out earlier if content is long and speed is slow */
            opacity: 1;
          }
          100% {
            transform: rotateX(25deg) translateY(-250%); /* Move far off-screen at top */
            opacity: 0; /* Fade out at the end */
          }
        }
      `}</style>
    </>
  );
};

// --- StarWarsTheme Component (Main Export) ---
export default function t2() {
  const { messages, input, handleInputChange, handleSubmit: aiHandleSubmit, isLoading, error, setMessages } = useChat({
    api: "/api/chat", // Your actual API endpoint
    onError: (err) => {
      console.error("StarWarsTheme API error:", err);
    }
  });

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [starWarsAnimationKey, setStarWarsAnimationKey] = useState(0);

  const latestAiMessage = useMemo(() => {
    return [...messages].reverse().find(m => m.role === 'assistant');
  }, [messages]);

  const latestUserMessage = useMemo(() => {
    return [...messages].reverse().find(m => m.role === 'user');
  }, [messages]);

  const aiScrollContent = useMemo(() => {
    // Check if the very last message is from the user and we are loading.
    const isProcessingLastUserQuery = isLoading && latestUserMessage && messages.indexOf(latestUserMessage) === messages.length - 1;

    if (isProcessingLastUserQuery) {
      return {
        title: "A DISTURBANCE IN THE FORCE",
        text: "The AI Holocron is contemplating your query...\n\nPatience, you must have."
      };
    }
    // If the latest message is from AI, display it.
    if (latestAiMessage && messages.indexOf(latestAiMessage) === messages.length - 1) {
      // Check for a common "Episode" structure in welcome.
      const content = latestAiMessage.content;
      const titleMatch = content.match(/^(EPISODE [A-Z0-9]+(?:\s*-\s*[A-Z0-9]+)*\s*[A-Z\s]+)\n\n/i);
      if (titleMatch) {
        return { title: titleMatch[1].trim(), text: content.substring(titleMatch[0].length) };
      }
      return { title: "THE ORACLE SPEAKS", text: content };
    }
    // For the initial welcome message if it's the only one
    if (messages.length === 1 && messages[0].id === WELCOME_MSG_ID && messages[0].role === 'assistant') {
        const content = messages[0].content;
        const titleMatch = content.match(/^(EPISODE [A-Z0-9]+(?:\s*-\s*[A-Z0-9]+)*\s*[A-Z\s]+)\n\n/i);
        if (titleMatch) {
            return { title: titleMatch[1].trim(), text: content.substring(titleMatch[0].length) };
        }
        return { title: "A MESSAGE FROM THE ARCHIVES", text: content };
    }
    return { title: "", text: "" }; // No AI text to scroll
  }, [isLoading, messages, latestAiMessage, latestUserMessage]);


  useEffect(() => {
    // Re-trigger animation only if there's actual content for the scroll
    if (aiScrollContent.text || aiScrollContent.title) {
      setStarWarsAnimationKey(prevKey => prevKey + 1);
    }
  }, [aiScrollContent]); // Dependency on the whole object

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const WELCOME_MSG_ID = 'welcome-msg-starwars-holocron';
  useEffect(() => {
    if (messages.length === 0 && !isLoading) {
        const welcomeMessage: Message = {
            id: WELCOME_MSG_ID,
            role: 'assistant',
            content: "EPISODE I\nTHE AWAKENING HOLOCRON\n\nA long time ago, in a galaxy far, far away...\n\n...an ancient Holocron stirs. Within its crystalline depths lies knowledge untold.\n\nSpeak your query, seeker, and let the wisdom of the Force flow through the cosmic scroll.",
            createdAt: new Date(),
        };
        setTimeout(() => setMessages([welcomeMessage]), 0); // useChat's setMessages
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, setMessages]); // `setMessages` is stable from useChat generally

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || !input.trim()) return;
    aiHandleSubmit(e);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && input.trim()) {
      e.preventDefault();
      const syntheticEvent = e as unknown as FormEvent<HTMLFormElement>;
      aiHandleSubmit(syntheticEvent);
    }
  };

  const humanReplyToShow = latestUserMessage?.content || "";

  return (
    <>
      {/* Global styles including font imports */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Pathway+Gothic+One&display=swap');

        body { /* Apply basic styling to body for the theme's context */
          margin: 0;
          background-color: #000; /* Default black background for the page */
          color: #e0e0e0; /* Default light text color */
          font-family: 'Inter', sans-serif;
          overflow-x: hidden; /* Prevent horizontal scrollbars from animations */
        }
        /* Basic scrollbar for textarea */
        .sw-theme-textarea::-webkit-scrollbar {
          width: 8px;
        }
        .sw-theme-textarea::-webkit-scrollbar-track {
          background: #1f2937; /* gray-800 approx */
        }
        .sw-theme-textarea::-webkit-scrollbar-thumb {
          background: #FFE81F; /* star-wars-yellow */
          border-radius: 4px;
        }
        .sw-theme-textarea::-webkit-scrollbar-thumb:hover {
          background: #f0db1e; /* slightly darker yellow */
        }
      `}</style>

      <div className="star-wars-theme-container">
        <header className="header">
          {/* You can use an SVG icon here if preferred */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="icon-sm text-star-wars-yellow">
              <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
          </svg>
          <h1>AI HOLOCRON</h1>
        </header>

        <main className="main-content">
          <div className="ai-reply-container">
            <StarWarsScroll
              title={aiScrollContent.title}
              text={aiScrollContent.text}
              animationKey={starWarsAnimationKey}
            />
          </div>

          <div className="human-reply-wrapper">
            {humanReplyToShow && (
              <div className="human-reply-box">
                <UserCircle2 className="icon-lg text-sky-400" />
                <p>{humanReplyToShow}</p>
              </div>
            )}
            {!humanReplyToShow && messages.length > 0 && !isLoading && (
              <div className="human-reply-placeholder">
                 Awaiting your transmission...
              </div>
            )}
             {!humanReplyToShow && messages.length === 0 && !isLoading && (
                <div className="human-reply-placeholder">
                    Your query will appear here.
                </div>
            )}
          </div>
        </main>

        {error && (
          <div className="error-banner">
            <AlertTriangle className="icon-sm text-red-500" />
            <span>A critical failure in the Holocron: {error.message || "An unexpected error occurred."}</span>
          </div>
        )}

        <footer className="footer">
          <form onSubmit={handleFormSubmit} className="form">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              placeholder="Transmit your query to the Holocron..."
              className="textarea sw-theme-textarea" // Added class for scrollbar styling
              rows={1}
              disabled={isLoading}
              aria-label="Chat input for AI Holocron"
            />
            <button
              type="submit"
              title="Transmit (Enter)"
              className="submit-button"
              disabled={isLoading || !input.trim()}
            >
              {isLoading && latestUserMessage && messages.indexOf(latestUserMessage) === messages.length -1 ? (
                <Loader2 className="icon-md animate-spin" />
              ) : (
                <SendIcon className="icon-md" />
              )}
            </button>
          </form>
        </footer>
      </div>

      {/* Component-specific styles */}
      <style jsx>{`
        .star-wars-theme-container {
          display: flex;
          flex-direction: column;
          height: 100vh; /* Full viewport height */
          max-height: 100vh; /* Prevent growing beyond viewport due to content */
          background-color: #000000;
          color: #e0e0e0; /* Default light text for the theme */
          font-family: 'Inter', sans-serif;
          overflow: hidden; /* Key: prevents page scroll from crawl/content overflow */
        }

        /* Header Styles */
        .header {
          padding: 0.75rem 1rem; /* py-3 px-4 */
          background-color: rgba(17, 24, 39, 0.85); /* gray-900 with opacity */
          backdrop-filter: blur(3px);
          color: #FFE81F; /* star-wars-yellow */
          text-align: center;
          position: sticky; /* Or fixed, depending on desired scroll behavior with page */
          top: 0;
          z-index: 20;
          border-bottom: 1px solid rgba(55, 65, 81, 0.5); /* border-gray-700/50 */
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .header h1 {
          font-family: 'Pathway Gothic One', sans-serif;
          font-size: 1.25rem; /* text-xl */
          letter-spacing: 0.075em; /* tracking-wider */
          margin-left: 0.625rem; /* space-x-2.5 */
          font-weight: 400; /* Pathway is thin, so normal weight is fine */
        }

        /* Main Content Area Styles */
        .main-content {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end; /* Pushes AI scroll and human reply to bottom */
          position: relative; /* For potential absolute positioned children if needed */
          overflow: hidden; /* Important for containing the StarWarsScroll's overflow */
          width: 100%;
        }

        .ai-reply-container {
            width: 100%;
            height: 65vh; /* Explicit height for the scroll area, adjust as needed */
            flex-shrink: 0; /* Prevent it from shrinking */
            overflow: hidden; /* Ensures the scroll doesn't break out */
            position: relative; /* Context for StarWarsScroll's absolute positioning if it used it */
        }

        .human-reply-wrapper {
            width: 100%;
            max-width: 48rem; /* max-w-3xl */
            padding: 0.5rem 1rem 1rem 1rem; /* Some padding around it */
            margin-top: 0.5rem; /* Space between AI reply and human reply */
            flex-shrink: 0; /* Don't shrink this container */
        }
        .human-reply-box {
          padding: 0.875rem; /* p-3.5 */
          background-color: rgba(31, 41, 55, 0.5); /* bg-gray-800/50, more transparent */
          border: 1px solid rgba(55, 65, 81, 0.4); /* border-gray-700/40 */
          border-radius: 0.375rem; /* rounded-md */
          font-size: 0.925rem; /* slightly larger than sm */
          display: flex;
          align-items: flex-start;
          color: #d1d5db; /* text-gray-300 */
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .human-reply-box p {
          word-break: break-word;
          line-height: 1.6;
          margin-left: 0.75rem;
          white-space: pre-wrap; /* Preserve line breaks from user input */
        }
        .human-reply-placeholder {
            padding: 0.875rem;
            color: rgba(107, 114, 128, 0.7); /* text-gray-500/70 */
            font-style: italic;
            font-size: 0.875rem;
            text-align: center;
            min-height: 58px; /* approx human-reply-box height with one line */
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 0.375rem;
            background-color: rgba(31, 41, 55, 0.2);
        }

        /* Footer Styles (Input Area) */
        .footer {
          flex-shrink: 0;
          border-top: 1px solid rgba(55, 65, 81, 0.6); /* border-t border-gray-700/60 */
          padding: 0.75rem 1rem; /* p-3 sm:p-4 */
          background-color: rgba(17, 24, 39, 0.85); /* gray-900 with opacity */
          backdrop-filter: blur(3px);
          display: flex;
          justify-content: center;
          align-items: flex-end;
        }
        .form {
          display: flex;
          align-items: flex-end;
          width: 100%;
          max-width: 42rem; /* max-w-xl */
        }
        .textarea {
          flex: 1 1 0%;
          resize: none;
          min-height: 48px; /* Adjusted for padding and border */
          max-height: 150px;
          background-color: rgba(55, 65, 81, 0.9); /* bg-gray-700/90 */
          border: 1px solid rgba(75, 85, 99, 0.7); /* border-gray-600/70 */
          padding: 0.625rem 0.875rem; /* py-2.5 px-3.5 */
          font-size: 0.9rem;
          color: #e5e7eb; /* text-gray-200 */
          border-radius: 0.375rem 0 0 0.375rem; /* rounded-l-md */
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
          line-height: 1.5;
        }
        .textarea::placeholder {
          color: rgba(156, 163, 175, 0.7); /* placeholder-gray-400/70 */
        }
        .textarea:focus {
          outline: none;
          border-color: #FFE81F;
          box-shadow: 0 0 0 2px rgba(255, 232, 31, 0.4); /* ring-2 ring-star-wars-yellow/40 */
        }
        .textarea:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            background-color: rgba(55,65,81,0.5);
        }
        .submit-button {
          padding: 0.5rem;
          background-color: #0ea5e9; /* sky-500 */
          color: white;
          border-radius: 0 0.375rem 0.375rem 0; /* rounded-r-md */
          border: 1px solid #0ea5e9; /* border-sky-500 */
          border-left: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 48px; /* Match textarea height */
          width: 48px; /* w-[48px] */
          flex-shrink: 0;
          transition: background-color 0.15s ease-in-out;
        }
        .submit-button:hover:not(:disabled) {
          background-color: #0284c7; /* sky-600 */
        }
        .submit-button:active:not(:disabled) {
          background-color: #0369a1; /* sky-700 */
        }
        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background-color: #374151; /* gray-700 for disabled state */
        }
        .submit-button:focus {
            outline: none;
            box-shadow: 0 0 0 2px #000000, 0 0 0 4px rgba(255, 232, 31, 0.7); /* ring-offset-black ring-star-wars-yellow */
        }

        /* Error Message Styles */
        .error-banner {
          padding: 0.75rem 1rem;
          text-align: center;
          font-size: 0.875rem;
          color: #fca5a5; /* text-red-300 (lighter red for dark bg) */
          background-color: rgba(159, 18, 57, 0.4); /* bg-red-900/ish with more transparency */
          border-top: 1px solid rgba(185, 28, 28, 0.5);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .error-banner span {
          margin-left: 0.5rem;
        }

        /* Loader animation */
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }

        /* Icon styling helper classes */
        .icon-sm { width: 1.125rem; height: 1.125rem; } /* ~18px */
        .icon-md { width: 1.25rem; height: 1.25rem; } /* ~20px */
        .icon-lg { width: 1.5rem; height: 1.5rem; margin-top: 0.125rem; } /* ~24px + slight alignment */

        .text-star-wars-yellow { color: #FFE81F; }
        .text-sky-400 { color: #38bdf8; }
        .text-red-500 { color: #ef4444; } /* For icon in error banner */
      `}</style>
    </>
  );
}