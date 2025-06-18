// src/app/console-chat/page.tsx
'use client';

import React, { useEffect, useRef, FormEvent, KeyboardEvent, useMemo } from 'react';
import { useChat, Message } from 'ai/react';
import { Loader2, SendIcon, CornerDownLeft } from 'lucide-react'; // Added CornerDownLeft for a different feel

// --- Markdown and Syntax Highlighting Imports ---
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// For a light background, 'vscDarkPlus' might be too contrasty.
// Consider 'ghcolors', 'prism' (default), 'coy', or 'solarizedlight'.
// Let's try 'ghcolors' or you can use a custom one.
import { ghcolors } from 'react-syntax-highlighter/dist/esm/styles/prism';
// import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';


interface CustomCodeRendererProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

interface QAPair {
    id: string;
    userQuestion: Message;
    aiReply: Message | null;
}

// Define a placeholder background image URL
const PARCHMENT_BACKGROUND_URL = '/images/parchment.jpg'; // Make sure this image exists in your public/images folder

export default function LetterChatPage() {
    const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages } = useChat({
        api: "/api/chat",
        onError: (err) => {
            console.error("Chat API error:", err);
        }
    });

    const qaContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

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
        if (qaContainerRef.current) {
            setTimeout(() => {
                if (qaContainerRef.current) {
                     qaContainerRef.current.scrollLeft = qaContainerRef.current.scrollWidth;
                }
            }, 0);
        }
    }, [qaPairs]);

    useEffect(() => {
        if (!isLoading) {
            inputRef.current?.focus();
        }
    }, [isLoading, messages]);

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !isLoading && input.trim()) {
            e.preventDefault();
            handleSubmit({} as FormEvent<HTMLFormElement>);
        }
    };

    const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isLoading && input.trim()) {
            handleSubmit(e);
        }
    };

    return (
        <div
            className="flex flex-col h-screen overflow-hidden font-['Kalam',_cursive] text-[#3a2e20]" // Using Kalam font, dark brown/sepia text
            style={{
                backgroundImage: `url(${PARCHMENT_BACKGROUND_URL})`,
                backgroundSize: 'cover', // Or 'repeat' if using a tileable texture
                backgroundPosition: 'center',
            }}
        >
            <div
                ref={qaContainerRef}
                className="flex flex-1 overflow-x-auto space-x-12 p-6 pt-20 custom-scrollbar" // Added more padding
            >
                {qaPairs.length === 0 && !isLoading && (
                    <div className="flex-1 flex items-center justify-center text-gray-600/70 italic text-lg"> {/* Slightly more prominent */}
                        <p>Your correspondence will appear here. Pen a question to begin!</p>
                    </div>
                )}
                {qaPairs.map((pair, pairIndex) => (
                    <div
                        key={pair.id}
                        className="flex-shrink-0 w-[580px] sm:w-80 md:w-[600px] h-full flex flex-col 
                                   bg-[rgba(255,250,240,0.6)] backdrop-blur-sm  /* Slightly transparent paper on parchment */
                                   shadow-[2px_4px_8px_rgba(0,0,0,0.2)] /* Softer shadow */
                                   rounded-sm overflow-hidden border border-[rgba(189,170,142,0.5)]" // Subtle border
                    >
                        <div className="border-b border-[rgba(189,170,142,0.4)] p-3 pt-2"> {/* Lighter border */}
                            <div className=" flex flex-row items-center gap-1.5 ">
                                <span className="text-[#005A9C] block text-sm font-semibold tracking-wider uppercase"> {/* Blue ink for heading */}
                                    Query
                                </span>
                                <span className="text-[#005A9C] block text-sm font-semibold tracking-wider uppercase">
                                    {pairIndex + 1}
                                </span>
                            </div>
                            <div className="h-28 overflow-y-auto text-base custom-scrollbar pr-2 leading-relaxed"> {/* Increased text size, leading */}
                                <p className="whitespace-pre-wrap">{pair.userQuestion.content}</p>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col p-3 pt-2 overflow-hidden">
                             <span className="text-[#005A9C] block text-sm font-semibold mb-2 tracking-wider uppercase"> {/* Blue ink for heading */}
                                AI's Response
                            </span>
                            <div className="flex-1 overflow-y-auto text-base custom-scrollbar pr-2 space-y-3 leading-relaxed"> {/* Increased text size, leading */}
                                {pair.aiReply && (
                                    <div className="prose-letter max-w-none"> {/* Using custom prose class */}
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                code({ node, inline, className, children, ...props }: CustomCodeRendererProps) {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    return !inline && match ? (
                                                        <SyntaxHighlighter
                                                            style={ghcolors} // Using a light-background friendly theme
                                                            language={match[1]}
                                                            PreTag="div"
                                                            {...props}
                                                        >
                                                            {String(children).replace(/\n$/, '')}
                                                        </SyntaxHighlighter>
                                                    ) : (
                                                        // Inline code styling handled by .prose-letter code in globals.css
                                                        <code className={className} {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                },
                                            }}
                                        >
                                            {pair.aiReply.content}
                                        </ReactMarkdown>
                                     </div>
                                )}
                                {isLoading && pairIndex === qaPairs.length - 1 && !pair.aiReply && (
                                    <div className="flex items-center text-gray-500/80">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        <span>The AI is composing a reply...</span>
                                    </div>
                                )}
                                {error && pairIndex === qaPairs.length - 1 && !pair.aiReply && !isLoading && (
                                    <p className="text-red-600 text-sm">Error: {error.message}</p>
                                )}
                                {!pair.aiReply && !isLoading && !(error && pairIndex === qaPairs.length - 1) && (
                                     <p className="text-gray-500/70 italic">Awaiting the AI's thoughts...</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {error && qaPairs.length === 0 && (
                 <div className="p-3 text-center text-sm text-red-600 border-t border-red-500/50 bg-[rgba(255,250,240,0.5)]">
                    Error: {error.message}
                </div>
            )}

            <div className="border-t border-[rgba(115,95,71,0.5)] p-4 bg-[rgba(245,240,230,0.5)] backdrop-blur-sm"> {/* Sepia-toned border, slightly transparent bg */}
                <div className="flex-1 flex justify-center">
                    <form
                        onSubmit={handleFormSubmit}
                        className="flex items-end gap-3 w-full max-w-2xl"
                    >
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Pen your thoughts here..."
                            className="flex-1 resize-none min-h-[60px] max-h-[180px] 
                                       bg-transparent border border-[rgba(115,95,71,0.6)] 
                                       rounded-sm p-3 focus:ring-1 focus:ring-[#005A9C] focus:border-[#005A9C]
                                       focus:outline-none text-base custom-scrollbar placeholder:text-gray-500/90"
                            rows={2}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            title="Send (Enter)"
                            className="p-2 bg-[#005A9C] hover:bg-[#00487C] text-white 
                                       rounded-sm disabled:opacity-60 disabled:cursor-not-allowed 
                                       flex items-center justify-center h-[60px] w-[60px] flex-shrink-0
                                       shadow-md hover:shadow-lg transition-all duration-150"
                            disabled={isLoading || !input.trim()}
                        >
                            {isLoading && (!messages.length || messages[messages.length - 1].role === 'user')
                                ? <Loader2 className="h-7 w-7 animate-spin" />
                                : <SendIcon className="h-7 w-7" /> /* Or CornerDownLeft for a different feel */
                            }
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}