// src/components/themes/spreadsheet/SpreadsheetTheme.tsx
"use client";

import { useChat, type Message } from '@ai-sdk/react'; // Ensure this is the correct import for your project
import React, { useEffect, useRef, FormEvent, KeyboardEvent, useMemo } from 'react';
import { SendIcon, Sigma, FileText, MessageSquare, Loader2, AlertTriangle } from "lucide-react";

// --- Markdown and Syntax Highlighting Imports ---
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { ghcolors } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Light theme for spreadsheet

// Props interface for custom code renderer
interface CustomCodeRendererProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

// Define the QAPair interface (as provided)
interface QAPair {
    id: string; // Typically the user's message ID that initiates the pair
    userQuestion: Message;
    aiReply: Message | null;
}

export default function SpreadsheetTheme() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages } = useChat({
    api: "/api/chat",
    onError: (err) => {
      console.error("SpreadsheetTheme API error:", err);
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollPositionBeforeKeyboard = useRef<number | null>(null);
  const isHandlingKeyboardScroll = useRef(false);
  const scrollToBottomAfterUserSend = useRef(false);

  // --- QAPair Generation (Logic from cons/page.tsx and GhoTheme) ---
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
    if (isHandlingKeyboardScroll.current) return;
    if (scrollToBottomAfterUserSend.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      scrollToBottomAfterUserSend.current = false;
    }
  }, [messages, qaPairs]); // qaPairs added as dependency, though messages change is primary trigger

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleActualFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || !input.trim()) return;
    scrollToBottomAfterUserSend.current = true;
    handleSubmit(e);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && input.trim()) {
      e.preventDefault();
      scrollToBottomAfterUserSend.current = true;
      handleSubmit({} as FormEvent<HTMLFormElement>);
    }
  };

  const handleInputFocus = () => {
    if (chatContainerRef.current) {
      scrollPositionBeforeKeyboard.current = chatContainerRef.current.scrollTop;
      isHandlingKeyboardScroll.current = true;
      requestAnimationFrame(() => {
        if (chatContainerRef.current && scrollPositionBeforeKeyboard.current !== null) {
          const { scrollHeight, clientHeight } = chatContainerRef.current;
          const isScrolledUp = scrollHeight - scrollPositionBeforeKeyboard.current - clientHeight > 100;
          if (isScrolledUp) {
            chatContainerRef.current.scrollTop = scrollPositionBeforeKeyboard.current;
          }
        }
        setTimeout(() => {
          isHandlingKeyboardScroll.current = false;
          scrollPositionBeforeKeyboard.current = null;
        }, 100);
      });
    }
  };

  const handleInputBlur = () => { /* Optional */ };

  const WELCOME_MSG_ID = 'welcome-msg-spreadsheet';
  useEffect(() => {
    // Check if messages is empty AND qaPairs is also empty (to avoid adding welcome if chat already started)
    if (messages.length === 0 && qaPairs.length === 0 && !isLoading) {
        const welcomeMessage: Message = {
            id: WELCOME_MSG_ID,
            role: 'assistant',
            content: 'Welcome!',
            createdAt: new Date(),
        };
        setTimeout(() => setMessages([welcomeMessage]), 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]); // Re-evaluate if loading state changes and messages are still empty

  const markdownComponents = {
    code({ node, inline, className, children, ...props }: CustomCodeRendererProps) {
        const match = /language-(\w+)/.exec(className || '');
        return !inline && match ? (
            <SyntaxHighlighter
                style={ghcolors}
                language={match[1]}
                PreTag="div"
                className="rounded-md border border-gray-200 bg-gray-50 text-sm my-2 !whitespace-pre-wrap" // Added !whitespace-pre-wrap for highlighter
                {...props}
            >
                {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
        ) : (
            <code 
              className={`${className || ''} bg-gray-200 text-indigo-700 font-mono text-xs px-1 py-0.5 rounded-sm`}
              {...props}
            >
                {children}
            </code>
        );
    },
    // p: ({node, ...props}) => <p className="mb-2" {...props} />, // Example customization
  };

  // Special handling for the welcome message if it's the only one.
  const showWelcomeMessageStandalone = 
    messages.length === 1 && 
    messages[0].id === WELCOME_MSG_ID && 
    messages[0].role === 'assistant';

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-100 text-gray-800 antialiased">
      <header className="h-[50px] border-b border-gray-300 px-4 flex items-center shrink-0 bg-gray-200/70 shadow-sm">
        <FileText className="w-5 h-5 mr-2.5 text-blue-600" />
        <h1 className="text-base font-semibold text-gray-700">ChatSheet_AI.xlsx</h1>
      </header>

      <div className="flex-1 flex flex-col overflow-hidden bg-white border-b border-gray-300">
        <div className="flex shrink-0 bg-gray-100 border-b border-gray-300 shadow-sm z-10">
          <div className="w-20 px-2 py-2 text-center font-semibold text-xs text-gray-500 tracking-wider border-r border-gray-300">CELL</div>
          <div className="flex-1 px-4 py-2 font-semibold text-sm text-gray-600">ENTRY</div>
        </div>
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-track-gray-100"
        >
          {/* Render standalone welcome message if applicable */}
          {showWelcomeMessageStandalone && (
            <div className={`flex border-b border-gray-200 min-h-[40px] group bg-green-50/30 hover:bg-green-100/40`}>
              <div className={`w-20 shrink-0 px-2 py-2.5 text-center font-mono text-xs text-green-700 border-r border-gray-200 group-hover:border-gray-300 flex items-center justify-center transition-colors duration-150 bg-green-100/20 group-hover:bg-green-200/30`}>
                A0 {/* Special index for welcome */}
              </div>
              <div className={`flex-1 px-4 py-2.5`}>
                <div className={`text-sm leading-relaxed max-w-3xl text-gray-800`}>
                  <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                    {messages[0].content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* Render QAPairs */}
          {qaPairs.map((pair, pairIndex) => (
            <React.Fragment key={pair.id}>
              {/* User Question Row */}
              <div className={`flex border-b border-gray-200 min-h-[40px] group bg-blue-300/40 hover:bg-blue-100/50`}>
                <div className={`w-20 shrink-0 px-2 py-2.5 text-center font-mono text-xs text-blue-600 border-r border-gray-200 group-hover:border-gray-300 flex items-center justify-center transition-colors duration-150 bg-blue-100/30 group-hover:bg-blue-200/30`}>
                  {`U${pairIndex + 1}`}
                </div>
                <div className={`flex-1 px-4 py-2.5`}>
                  <div className={`whitespace-pre-wrap break-words text-sm leading-relaxed max-w-3xl text-gray-700`}>
                    {pair.userQuestion.content}
                  </div>
                </div>
              </div>

              {/* AI Reply Row (or loading/placeholder) */}
              <div className={`flex border-b border-gray-200 min-h-[40px] group bg-green-300/30 hover:bg-green-100/40`}>
                <div className={`w-20 shrink-0 px-2 py-2.5 text-center font-mono text-xs text-green-700 border-r border-gray-200 group-hover:border-gray-300 flex items-center justify-center transition-colors duration-150 bg-green-100/20 group-hover:bg-green-200/30`}>
                  {`AI${pairIndex + 1}`}
                </div>
                <div className={`flex-1 px-4 py-2.5`}>
                  <div className={`  max-w-3xl prose prose-sm prose-invert   leading-none whitespace-pre-wrap text-gray-800`}>
                    {pair.aiReply ? (
                      <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                        {pair.aiReply.content}
                      </ReactMarkdown>
                    ) : isLoading && pairIndex === qaPairs.length - 1 ? (
                      <div className="flex items-center text-sm text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin mr-2 text-gray-400" />
                        AI is processing...
                      </div>
                    ) : (
                      <div className="italic text-gray-400 text-xs">Awaiting response...</div>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} className="h-px" />
          
          {/* Initial empty state message (if no welcome, no QAPairs, and not loading) */}
          {qaPairs.length === 0 && !showWelcomeMessageStandalone && !isLoading && messages.length === 0 && (
            <div className="p-10 text-center text-gray-400">
                <div className="max-w-3xl mx-auto">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Spreadsheet is ready for input.</p>
                </div>
            </div>
          )}
        </div>
      </div>
      
      {error && (         <div className="p-3 text-center text-xs text-red-700 bg-red-100 border-t border-red-300 shrink-0 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span>Chat Error: {error.message || "An unknown error occurred. Please try again."}</span>
        </div>)}
      <div className="shrink-0 border-t-2 border-gray-300 p-3 bg-gray-100 flex justify-center items-end shadow-top">
        {/* Input bar remains same */}
        <div className="flex items-end w-full max-w-2xl">
          <div className="fx-label h-[60px] px-3 border border-r-0 border-gray-300 bg-gray-200 text-gray-700 text-sm rounded-l-md flex items-center justify-center shrink-0 select-none">
            <Sigma className="w-5 h-5 text-gray-600" />
          </div>
          <form onSubmit={handleActualFormSubmit} className="flex-1 flex items-end">
            <textarea
              ref={inputRef} value={input} onChange={handleInputChange} onKeyDown={handleInputKeyDown}
              onFocus={handleInputFocus} onBlur={handleInputBlur} placeholder="Type your message here..."
              className="flex-1 resize-none min-h-[60px] max-h-[180px] bg-white border-y border-gray-300 p-2.5 text-sm text-gray-800 placeholder-gray-500 scrollbar-thin scrollbar-thumb-gray-400/80 scrollbar-track-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              rows={1} disabled={isLoading} aria-label="Chat input"
            />
            <button
              type="submit" title="Send (Enter)"
              className="p-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-r-md disabled:opacity-60 disabled:cursor-not-allowed border border-l-0 border-gray-300 hover:border-gray-400 flex items-center justify-center h-[60px] w-[60px] flex-shrink-0 transition-colors duration-150"
              disabled={isLoading || !input.trim()}
            >
              {isLoading && qaPairs.some(p => p.userQuestion.id === messages[messages.length -1]?.id && !p.aiReply) ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <SendIcon className="h-6 w-6" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}