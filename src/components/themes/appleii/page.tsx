// src/components/themes/appleii/page.tsx
'use client';

import React, { useEffect, useRef, FormEvent, KeyboardEvent, useMemo, useState } from 'react';
import { useChat, Message } from 'ai/react'; // Changed from @ai-sdk/react
import { Loader2, SendIcon } from 'lucide-react'; // For loading and send icons

// --- Markdown and Syntax Highlighting Imports ---
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// Using a dark theme that can be styled to be more retro. okaidia is an example.
// You might want to create a custom PrismJS theme or heavily override for a true Apple II feel.
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';

// --- Type Definitions (same as cons/page.tsx) ---
interface CustomCodeRendererProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

interface QAPair {
    id: string; // Using user's message ID as the pair ID
    userQuestion: Message;
    aiReply: Message | null;
}

// --- AIResponseMessageAppleII (handles typing animation and Markdown for AI replies) ---
const AIResponseMessageAppleII = ({
    content,
    isLastPair,
    isLoadingStream, // True if this specific message part of last pair and is actively streaming/loading
    cursorVisible,
    markdownComponents,
} : {
    content: string;
    isLastPair: boolean;
    isLoadingStream: boolean;
    cursorVisible: boolean;
    markdownComponents: any; // ReactMarkdown components prop type
}) => {
    const [displayedContent, setDisplayedContent] = useState("");
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const TYPING_SPEED = 10; // Adjusted typing speed for Apple II feel

    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (isLastPair) {
            // If not actively streaming and content is fully displayed, just set it and exit.
            if (!isLoadingStream && displayedContent.length >= content.length && content.length > 0) {
                setDisplayedContent(content);
                return;
            }
            // If actively streaming but no content yet (waiting for first chunk), show nothing.
            if (isLoadingStream && content === "") {
                setDisplayedContent("");
                return;
            }

            let charIndex = 0;
            // Try to continue from where it left off if content is appended
            if (content.startsWith(displayedContent)) {
                charIndex = displayedContent.length;
            } else {
                // Content changed fundamentally (e.g. new response), reset displayed text
                setDisplayedContent(""); 
            }
            
            if (charIndex < content.length) {
                intervalRef.current = setInterval(() => {
                    setDisplayedContent(prev => {
                        const nextCharIndex = prev.length + 1;
                        if (nextCharIndex <= content.length) {
                            return content.substring(0, nextCharIndex);
                        } else {
                            if (intervalRef.current) clearInterval(intervalRef.current);
                            return prev;
                        }
                    });
                }, TYPING_SPEED);
            } else {
                 // Content is already fully displayed (e.g. stream ended or caught up)
                 setDisplayedContent(content);
            }

        } else { // Not the last pair, or not streaming: display content instantly
            setDisplayedContent(content);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [content, isLastPair, isLoadingStream, TYPING_SPEED]); // Removed displayedContent from deps


    // Show cursor if:
    // 1. It's the last pair AND it's actively streaming (content might be empty or growing)
    // 2. OR It's the last pair AND the typing animation interval is active
    const showActualCursor = isLastPair && (isLoadingStream || intervalRef.current !== null) && cursorVisible;

    return (
        <div className="text-[#5dfc70] font-apple-ii whitespace-pre-wrap min-h-[1em]"> {/* min-h to keep space for cursor */}
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {displayedContent}
            </ReactMarkdown>
            {showActualCursor && displayedContent === content && ( // Show cursor at end only when typing animation for current content is complete
                 <span className={`ml-0.5  ${cursorVisible ? "opacity-100" : "opacity-0"}`}>█</span>
            )}
             {isLastPair && isLoadingStream && displayedContent !== content && ( // Show cursor while typing
                <span className={`ml-0.5 inline-block align-text-bottom ${cursorVisible ? "opacity-100" : "opacity-0"}`}>█</span>
            )}
            {isLastPair && isLoadingStream && content === "" && ( // Show cursor if waiting for first chunk
                <span className={`ml-0.5 inline-block align-text-bottom ${cursorVisible ? "opacity-100" : "opacity-0"}`}>█</span>
            )}
        </div>
    );
};


// --- Main Chat Component ---
export default function AppleIIChatPage() {
    const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages } = useChat({
        api: "/api/chat",
        onError: (err) => {
            console.error("Chat API error:", err);
            // Optionally, display a user-friendly error message on the UI
        }
    });

    const qaContainerRef = useRef<HTMLDivElement>(null); // For the scrollable messages area
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null); // For auto-scrolling

    const [powerOn, setPowerOn] = useState(false);
    const [cursorVisible, setCursorVisible] = useState(true); // Blinking cursor for input-like areas

    // Derived Q&A pairs from messages
    const qaPairs: QAPair[] = useMemo(() => {
        const pairs: QAPair[] = [];
        messages.forEach((msg, index) => {
            if (msg.role === 'user') {
                let currentAiReply: Message | null = null;
                if (index + 1 < messages.length && messages[index + 1].role === 'assistant') {
                    currentAiReply = messages[index + 1];
                }
                pairs.push({
                    id: msg.id, // Use user's message ID as the pair ID
                    userQuestion: msg,
                    aiReply: currentAiReply,
                });
            }
        });
        return pairs;
    }, [messages]);

    // Scroll to bottom behavior (adapted from existing Apple II and cons)
    useEffect(() => {
        // Using messagesEndRef for smoother scrollIntoView for new messages
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

        // Fallback or alternative: scroll container height
        const timer = setTimeout(() => {
            if (qaContainerRef.current) {
                qaContainerRef.current.scrollTop = qaContainerRef.current.scrollHeight;
            }
        }, 100); // Slight delay for DOM updates

        return () => clearTimeout(timer);
    }, [qaPairs, isLoading]); // Trigger on new pairs or loading state change

    // Input focus behavior
    useEffect(() => {
        if (!isLoading) {
            inputRef.current?.focus();
        }
    }, [isLoading, qaPairs]); // Focus when loading stops or new pair is fully rendered

    // Power-on effect
    useEffect(() => {
        setPowerOn(true);
    }, []);

    // Blinking cursor effect for visual elements (not tied to actual input focus)
    useEffect(() => {
        const interval = setInterval(() => setCursorVisible(v => !v), 530);
        return () => clearInterval(interval);
    }, []);
    
    // Body background temporary change
    useEffect(() => {
        const originalBackgroundColor = document.body.style.backgroundColor;
        document.body.style.backgroundColor = 'black';
        return () => {
          document.body.style.backgroundColor = originalBackgroundColor;
        };
    }, []);


    // Input handling: Enter to send, Shift+Enter for newline
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !isLoading && input.trim()) {
            e.preventDefault();
            handleSubmit({} as FormEvent<HTMLFormElement>); // Vercel AI SDK expects a FormEvent
        }
    };

    // Form submission
    const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isLoading && input.trim()) {
            handleSubmit(e);
        }
    };

    // Markdown components styling for Apple II
    const appleIIMarkdownComponents = {
        code({ node, inline, className, children, ...props }: CustomCodeRendererProps ) {
            const match = /language-(\w+)/.exec(className || '');
            if (!inline && match) {
                return (
                    <SyntaxHighlighter
                        style={okaidia} // Base style
                        language={match[1]}
                        PreTag="div"
                        className="font-apple-ii text-xs my-2 p-2 border border-[#5dfc7033] overflow-x-auto custom-scrollbar-appleii"
                        customStyle={{ background: 'transparent', border: '1px solid #5dfc7033', color: '#5dfc70' }}
                        codeTagProps={{style: { fontFamily: 'inherit', color: 'inherit', background: 'transparent' }}}
                        {...props}
                    >
                        {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                );
            }
            return ( // Inline code
                <code className={`bg-transparent text-green-300 px-0.5 ${className || ''}`} {...props}>
                    {children}
                </code>
            );
        },
        p: ({node, ...props}: any) => <p className=" " {...props} />,
        a: ({node, ...props}: any) => <a className="underline hover:text-white" target="_blank" rel="noopener noreferrer" {...props} />,
        ul: ({node, ...props}: any) => <ul className="list-disc list-inside ml-2" {...props} />,
        ol: ({node, ...props}: any) => <ol className="list-decimal list-inside ml-2" {...props} />,
        strong: ({node, ...props}: any) => <span className="font-bold text-[#8eff9d]" {...props} />, // Slightly brighter for bold
        em: ({node, ...props}: any) => <span className="italic" {...props} />, // Assuming font supports italic or browser emulates
        // You can add more custom renderers for h1-h6, blockquote, table, etc. to fit the Apple II style
    };


    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            {/* Screen with CRT effects */}
            <div
                className={`w-full max-w-4xl relative overflow-hidden bg-black rounded-md shadow-2xl shadow-green-900/50 transition-all duration-1000 ${
                powerOn ? "opacity-100" : "opacity-0"
                }`}
                style={{border: '1px solid #5dfc7050'}} // Subtle border for the "monitor"
            >
                {/* Scan lines overlay */}
                <div className="absolute inset-0 pointer-events-none z-20 scanlines"></div>
                {/* Screen glow effect */}
                <div className="absolute inset-0 pointer-events-none z-0 screen-glow"></div>

                {/* Actual chat interface (main content within the "screen") */}
                <div className="relative z-10 h-[90vh] flex flex-col font-apple-ii text-[#5dfc70]">
                    {/* Messages Area */}
                    <div
                        ref={qaContainerRef}
                        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar-appleii"
                    >
                        {qaPairs.length === 0 && !isLoading && (
                            <div className="text-[#5dfc70] opacity-80 text-center mt-20">
                                <p>- SYSTEM READY -</p>
                                <p className="mt-2 text-sm opacity-60">TYPE YOUR COMMAND BELOW AND PRESS RETURN.</p>
                            </div>
                        )}

                        {qaPairs.map((pair, pairIndex) => (
                            <div key={pair.id} className="mb-24"> {/* Each Q/A pair */}
                                {/* User Question */}
                                <div className="opacity-80 text-sm">
                                    ] USER:
                                </div>
                                <pre className="text-[#5dfc70] whitespace-pre-wrap pl-2 mb-4">{pair.userQuestion.content}</pre>

                                {/* AI Reply */}
                                <div className="mt-1">
                                    <div className="opacity-80 text-sm">
                                        ] SYSTEM:
                                    </div>
                                    <div className="pl-2 pb-12">
                                        {pair.aiReply ? (
                                            <AIResponseMessageAppleII
                                                content={pair.aiReply.content}
                                                isLastPair={pairIndex === qaPairs.length - 1}
                                                isLoadingStream={isLoading && pairIndex === qaPairs.length - 1}
                                                cursorVisible={cursorVisible}
                                                markdownComponents={appleIIMarkdownComponents}
                                            />
                                        ) : isLoading && pairIndex === qaPairs.length - 1 ? (
                                            // AI is actively working on this reply, show blinking cursor
                                            <div className="text-[#5dfc70] min-h-[1em]"> {/* min-h for cursor space */}
                                                {cursorVisible && <span className="opacity-100">█</span>}
                                            </div>
                                        ) : error && pairIndex === qaPairs.length - 1 ? (
                                            <p className="text-red-400">Error: {error.message}</p>
                                        ) : (
                                            // Fallback, should ideally not be seen if isLoading handles it
                                            <p className="text-gray-500 opacity-50 italic">Awaiting response...</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} /> {/* Anchor for scrolling */}
                    </div>

                    {/* Global Error Display (e.g., API connection failed before any messages) */}
                    {error && qaPairs.length === 0 && !isLoading && (
                        <div className="p-2 text-center text-xs text-red-400 border-t border-red-500/50">
                            SYSTEM ERROR: {error.message}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="border-t border-[#5dfc70] border-opacity-30 p-4 md:p-6">
                        <form onSubmit={handleFormSubmit} className="flex items-start gap-2">
                            <span className="text-[#5dfc70] pt-1.5">]</span>
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder={isLoading ? "SYSTEM PROCESSING..." : "TYPE HERE..."}
                                className="flex-1 resize-none bg-transparent border-none outline-none text-[#5dfc70] placeholder-[#5dfc70] placeholder-opacity-50 font-apple-ii min-h-[24px] max-h-[96px] leading-normal custom-scrollbar-appleii"
                                rows={1} // Start with 1 row, expands up to max-h
                                disabled={isLoading}
                                autoFocus
                            />
                            <button
                                type="submit"
                                title="Send (Return)"
                                className="p-1.5 bg-transparent hover:bg-[#5dfc70] hover:text-black text-[#5dfc70] rounded-sm disabled:opacity-50 disabled:cursor-not-allowed border border-[#5dfc7080] hover:border-[#5dfc70] flex items-center justify-center h-[36px] w-[60px] flex-shrink-0"
                                disabled={isLoading || !input.trim()}
                            >
                                {isLoading && (!messages.length || messages[messages.length - 1].role === 'user') ?
                                    <Loader2 className="h-5 w-5 animate-spin" /> :
                                    "SEND"} {/* Using text instead of icon for Apple II */}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}