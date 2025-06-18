// src/app/cons/page.tsx
'use client';

// --- MODIFIED: Added useState to the import list
import React, { useState, useEffect, useRef, FormEvent, KeyboardEvent, useMemo } from 'react';
import { useChat, Message } from 'ai/react';
import { Loader2, SendIcon } from 'lucide-react';

// --- Markdown and Syntax Highlighting Imports ---
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CustomCodeRendererProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

// Define the QAPair interface
interface QAPair {
    id: string;
    userQuestion: Message;
    aiReply: Message | null;
}

export default function ConsoleChatPage() {
    // --- ADDED: State to manage the selected AI provider ---
    // The state is declared *before* useChat so it can be used in the hook's options.
    const [selectedProvider, setSelectedProvider] = useState('google'); // Default provider

    // --- MODIFIED: The useChat hook now sends the provider state to the API ---
    const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages } = useChat({
        api: "/api/chat",
        body: {
            // This sends the selected provider's value to your backend route
            provider: selectedProvider,
        },
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
        <div className="flex flex-col h-screen bg-black text-gray-300 font-mono overflow-hidden">
            <div
                ref={qaContainerRef}
                className="flex flex-1 overflow-x-auto space-x-12 p-4 pt-20 custom-scrollbar"
            >
                {qaPairs.length === 0 && !isLoading && (
                    <div className="flex-1 flex items-center justify-center text-gray-500 italic">
                        <p>Your conversation will appear here. Ask something to begin!</p>
                    </div>
                )}
                {qaPairs.map((pair, pairIndex) => (
                    <div
                        key={pair.id}
                        className="flex-shrink-0 w-[380px] sm:w-80 md:w-[600px] h-full flex flex-col border border-slate-600 rounded-xs overflow-hidden"
                    >
                        <div className="border-b border-slate-600 p-2.5 pt-1">
                            <div className=" flex flex-row  items-center gap-1 ">
                                <span className="text-red-500 block text-xs font-semibold  tracking-wider uppercase">
                                    Question
                                </span>
                                <span className="text-red-500 block text-xs font-semibold  tracking-wider uppercase">
                                         {pairIndex+1}
                                </span>
                            </div>
                            <div className="h-28 overflow-y-auto text-xs custom-scrollbar pr-1.5">
                                <p className="whitespace-pre-wrap">{pair.userQuestion.content}</p>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col p-2.5 pt-1 overflow-hidden">
                            <span className="text-red-500 block text-xs font-semibold mb-1.5 tracking-wider uppercase">AI Reply</span>
                            <div className="flex-1 overflow-y-auto text-xs custom-scrollbar pr-1.5 space-y-2">
                                {pair.aiReply && (
                                    <div className="prose prose-sm prose-invert max-w-none leading-relaxed whitespace-pre-wrap">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                code({ node, inline, className, children, ...props }: CustomCodeRendererProps ) {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    return !inline && match ? (
                                                        <SyntaxHighlighter
                                                            style={vscDarkPlus}
                                                            language={match[1]}
                                                            PreTag="div"
                                                            {...props}
                                                        >
                                                            {String(children).replace(/\n$/, '')}
                                                        </SyntaxHighlighter>
                                                    ) : (
                                                        <code className={`${className || ''} bg-gray-700 px-1 py-0.5 rounded text-red-400`} {...props}>
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
                                    <div className="flex items-center text-gray-400">
                                        <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                                        <span>AI is replying...</span>
                                    </div>
                                )}
                                {error && pairIndex === qaPairs.length - 1 && !pair.aiReply && !isLoading && (
                                    <p className="text-red-400 text-xs">Error: {error.message}</p>
                                )}
                                {!pair.aiReply && !isLoading && !(error && pairIndex === qaPairs.length - 1) && (
                                     <p className="text-gray-600 italic">Waiting for AI response...</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {error && qaPairs.length === 0 && (
                 <div className="p-2 text-center text-xs text-red-400 border-t border-red-500">
                    Error: {error.message}
                </div>
            )}

            <div className="border-t flex items-center border-gray-500 p-3">
                <div className="flex-1 flex justify-center">
                    {/* --- MODIFIED: The form now includes the provider selector --- */}
                    <form
                        onSubmit={handleFormSubmit}
                        className="flex items-end gap-3 w-full max-w-2xl"
                    >
                        {/* --- ADDED: The provider selector dropdown --- */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="provider-select" className="text-xs text-gray-400 pl-1">AI Model</label>
                            <select
                                id="provider-select"
                                value={selectedProvider}
                                onChange={(e) => setSelectedProvider(e.target.value)}
                                disabled={isLoading}
                                className="h-[60px] bg-gray-900 border border-gray-700 rounded-sm p-2 focus:ring-1 focus:ring-red-400 focus:outline-none text-sm"
                            >
                                <option value="google">Google</option>
                                <option value="openai">OpenAI</option>
                                <option value="anthropic">Anthropic</option>
                            </select>
                        </div>
                        
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message here..."
                            className="flex-1 resize-none min-h-[60px] max-h-[180px] bg-gray-900 border border-gray-700 rounded-sm p-2 focus:ring-1 focus:ring-red-400 focus:outline-none text-sm custom-scrollbar"
                            rows={2}
                            disabled={isLoading}
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
        </div>
    );
}