// src/components/themes/wrapping_blocks/WrappingBlocksTheme.tsx
 
"use client";

import { useChat, type Message } from '@ai-sdk/react';
import React, { useEffect, useRef, FormEvent, KeyboardEvent, useMemo } from 'react';
import { SendIcon, MessageSquare, Loader2, AlertTriangle, User, Bot, AlignLeft } from "lucide-react";

// --- Markdown and Syntax Highlighting Imports ---
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

export default function SprodsheetTheme() { // Renaming to WrappingBlocksTheme would be more descriptive
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages } = useChat({
    api: "/api/chat",
    onError: (err) => {
      console.error("WrappingBlocksTheme API error:", err);
    }
  });

  const lastCardRef = useRef<HTMLDivElement>(null); // To scroll the last card into view (vertically)
  const chatContainerRef = useRef<HTMLDivElement>(null); // This is the flex-wrap container
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollPositionBeforeKeyboard = useRef<number | null>(null);
  const isHandlingKeyboardScroll = useRef(false);
  const scrollToBottomAfterUserSend = useRef(false); // Using this for vertical scroll to the last card

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

  // Vertical scroll to the newest card (which might be at the bottom of a new row)
  useEffect(() => {
    if (isHandlingKeyboardScroll.current) return;
    if (scrollToBottomAfterUserSend.current && lastCardRef.current) {
      lastCardRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      scrollToBottomAfterUserSend.current = false;
    }
  }, [qaPairs, messages]); // Trigger on qaPairs change

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

  // Keyboard scroll management (for vertical page scroll)
  const handleInputFocus = () => {
    if (document.documentElement) { // Check main document for scroll properties
      scrollPositionBeforeKeyboard.current = document.documentElement.scrollTop;
      isHandlingKeyboardScroll.current = true;
      requestAnimationFrame(() => {
        if (document.documentElement && scrollPositionBeforeKeyboard.current !== null) {
          const { scrollHeight, clientHeight } = document.documentElement;
          // Check if the user was scrolled significantly away from the bottom
          const isScrolledUp = scrollHeight - scrollPositionBeforeKeyboard.current - clientHeight > 100; 

          if (isScrolledUp) {
            // Only restore if they were scrolled up and keyboard likely caused a jump.
            // This is a heuristic and might need tuning.
            // document.documentElement.scrollTop = scrollPositionBeforeKeyboard.current;
            // For wrapping blocks, aggressive scroll restoration might be jarring.
            // We mainly want to ensure the input stays visible.
          }
        }
        setTimeout(() => {
          isHandlingKeyboardScroll.current = false;
          scrollPositionBeforeKeyboard.current = null;
        }, 150); // Increased timeout slightly
      });
    }
  };
  const handleInputBlur = () => { /* Optional */ };

  const WELCOME_MSG_ID = 'welcome-msg-wrappingblocks';
  useEffect(() => {
    if (messages.length === 0 && qaPairs.length === 0 && !isLoading) {
        const welcomeMessage: Message = {
            id: WELCOME_MSG_ID,
            role: 'assistant',
            content: `Ask at will.`,
            createdAt: new Date(),
        };
        setTimeout(() => {
            setMessages([welcomeMessage]);
            scrollToBottomAfterUserSend.current = true; // Scroll to the welcome message card
        },0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);








  const markdownComponents = {
    code({ node, inline, className, children, ...props }: CustomCodeRendererProps) {
        const match = /language-(\w+)/.exec(className || '');
        return !inline && match ? (
            <SyntaxHighlighter
                style={materialLight}
                language={match[1]}
                PreTag="div"
                className="!text-sm !bg-slate-50" // Override prose bg for code block
                {...props}
            >
                {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
        ) : (
            <code 
              className={`${className || ''} bg-slate-200/70 text-purple-700 font-mono text-[0.825em] px-1 py-0.5 rounded`}
              {...props}
            >
                {children}
            </code>
        );
    },
    a: ({node, ...props} : CustomCodeRendererProps) => <a target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700" {...props} />,
  };

  const showWelcomeMessageStandalone = 
    messages.length === 1 && 
    messages[0].id === WELCOME_MSG_ID && 
    messages[0].role === 'assistant';








  return (
    <div className="flex flex-col h-[100dvh] bg-slate-100 text-gray-800 antialiased">
      {/* Header */}
      <header className="h-[80px] border-b border-slate-300 px-4 flex items-center shrink-0 bg-white shadow-sm">
 
        <h1 className="text-lg font-semibold text-slate-700">Q&A Flow</h1>
      </header>

      {/* Main Chat Area: Flex-wrap container for Q&A Blocks, allowing vertical page scroll */}
      <div
        ref={chatContainerRef}
        className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto custom-scrollbar-vertical" // Main vertical scroll for the page content
      >
        <div className="flex flex-wrap gap-4 md:gap-6 justify-start items-start"> {/* flex-wrap is key here */}
          {/* Render standalone welcome message as a card */}
          {showWelcomeMessageStandalone && (
            <div 
              ref={qaPairs.length === 0 ? lastCardRef : null} // If only welcome msg, it's the last card
              className="w-72 sm:w-80 md:w-[410px] bg-white rounded-xl shadow-lg border border-teal-200 overflow-hidden flex flex-col"
            >
              <div className="p-4">
                <div className="flex items-center mb-3 text-teal-600">
                  <Bot size={20} className="mr-2" />
                  <span className="font-semibold text-sm">Assistant</span>
                </div>
                <div className="prose prose-sm max-w-none text-slate-700">
                  <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                    {messages[0].content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* Render QAPairs as Cards */}
          {qaPairs.map((pair, pairIndex) => (
            <div
              key={pair.id}
              ref={pairIndex === qaPairs.length - 1 ? lastCardRef : null} // Attach ref to the last card in the list
              className="w-72 sm:w-80 md:w-[350px] bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col"
              // Fixed width for blocks, can use responsive widths: e.g., w-full sm:w-80 md:w-96
            >
              {/* User Question Section */}
              <div className="p-4 border-b border-slate-200 bg-sky-50/30">
                <div className="flex items-center mb-2 text-sky-700">
                  <User size={18} className="mr-2" />
                  <span className="font-semibold text-sm">You (Q{pairIndex + 1})</span>
                </div>
                <div className="text-sm text-slate-800 max-h-60 overflow-y-auto custom-scrollbar-thin whitespace-pre-wrap break-words">
                  {pair.userQuestion.content}
                </div>
              </div>

              {/* AI Reply Section */}
              <div className="p-4 flex-1">
                <div className="flex items-center mb-3 text-teal-600">
                  <Bot size={20} className="mr-2" />
                  <span className="font-semibold text-sm">AI (A{pairIndex + 1})</span>
                </div>
                <div className="prose prose-sm max-w-none text-slate-700 max-h-[calc(100vh-400px)] overflow-y-auto custom-scrollbar-thin">
                  {pair.aiReply ? (
                    <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                      {pair.aiReply.content}
                    </ReactMarkdown>
                  ) : isLoading && pairIndex === qaPairs.length - 1 ? (
                    <div className="flex items-center text-sm text-slate-500 py-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2 text-slate-400" />
                      AI is thinking...
                    </div>
                  ) : (
                    <div className="italic text-slate-400 text-xs py-2">Awaiting response...</div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Initial empty state message (if no welcome, no QAPairs, and not loading) */}
          {qaPairs.length === 0 && !showWelcomeMessageStandalone && !isLoading && messages.length === 0 && (
            <div className="w-full flex flex-col items-center justify-center text-slate-500 pt-10">
                <MessageSquare className="w-16 h-16 mb-4 text-slate-400" />
                <p className="text-lg">Ask something to see the Q&A flow!</p>
            </div>
          )}
        </div>
      </div>
      
      {error && ( <div className="p-3 text-center text-xs text-red-700 bg-red-100 border-t border-red-300 shrink-0 flex items-center justify-center gap-2"> <AlertTriangle className="w-4 h-4 text-red-500" /> <span>Chat Error: {error.message || "An unknown error occurred. Please try again."}</span> </div>)}
      
      {/* Input Bar: Remains at the bottom, centered */}
      <div className="shrink-0 border-t border-slate-300/70 p-3 bg-white flex justify-center items-end shadow-top-light">
        <div className="flex items-end w-full max-w-xl"> {/* Max width for input area */}
          <form onSubmit={handleActualFormSubmit} className="flex-1 flex items-end gap-2">
            <textarea
              ref={inputRef} value={input} onChange={handleInputChange} onKeyDown={handleInputKeyDown}
              onFocus={handleInputFocus} onBlur={handleInputBlur} placeholder="Type your message..."
              className="flex-1 resize-none min-h-[60px] max-h-[180px] bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm text-slate-800 placeholder-slate-400 scrollbar-thin scrollbar-thumb-slate-400/80 scrollbar-track-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              rows={1} disabled={isLoading} aria-label="Chat input"
            />
            <button
              type="submit" title="Send (Enter)"
              className="p-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed border border-teal-600 flex items-center justify-center h-[60px] w-[60px] flex-shrink-0 transition-colors duration-150"
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