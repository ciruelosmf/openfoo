"use client";

import { useChat, type Message } from '@ai-sdk/react';
import { useEffect, useRef, useState } from "react";
import styles from './VintageTerminalChat.module.css';
import MenuButton from '@/components/MenuButton'; // Import the menu button


// --- ChatMessage Component CLEANED UP ---
function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const aiModelName = "AI SYSTEM";

  return (
    // REMOVED ml-4 and mb-12 from spans inside
 
      <div className={`leading-[1.3] whitespace-pre-wrap ml-4 font-apple-ii mb-8  ${styles.terminalText}`}> 
      {isUser ? (
        <>
          <span className="text-orange-400 ">- </span>
          <span className="text-orange-400">{message.content}</span>
        </>
      ) : (
        <>
          <span className="text-orange-400">{aiModelName}: </span>
          <span className="text-orange-400  ">{message.content}</span>
        </>
      )}
    </div>
  );
}


export default function VintageTerminalChat() {
  const aiModelName = "AI";
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    onError: (err) => {
      console.error("Chat error:", err);
      alert(`Error: ${err.message}. Check console for details.`);
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null); // Keep ref in case needed later
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorVisible, setCursorVisible] = useState(true);

// --- Auto-scroll Logic REFINED ---

  // --- Auto-scroll Logic: Scroll ONLY After User Message ---
  useEffect(() => {
    // Get the very last message in the array
    const lastMessage = messages[messages.length - 1];

    // Check if there are messages AND the *last* one is from the user
    if (lastMessage?.role === 'user') {
      // Use a small timeout to allow the DOM to update before scrolling
      // This ensures the new user message is rendered and included in scroll height calculation
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth", // Scroll smoothly after user input
          block: "end"        // Ensure the end is visible
        });
      }, 0); // Push execution slightly after render

      // Cleanup the timeout if messages change again before it fires or component unmounts
      return () => clearTimeout(timer);
    }

    // If the last message is not from the user (i.e., it's the AI replying),
    // do nothing. Let the user scroll manually if they need to.

  }, [messages]); // Depend ONLY on the messages array changing


  // Blinking cursor effect (Unchanged)
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  // Focus input (Unchanged)
  useEffect(() => {
    inputRef.current?.focus();
  }, [isLoading]);


  return (
    <div className={`flex flex-col items-start h-screen bg-black   text-orange-400   ${styles.terminal}`}>

 
           

      {/* Messages Area Container */}
      <div ref={chatContainerRef}   style={{ 
    scrollbarWidth: 'none',
    msOverflowStyle: 'none' 
  }} className={`w-full max-w-4xl flex-1 overflow-y-auto py-4 pt-20 pr-4 space-y-3 ${styles.terminalScrollable}`}>
        {messages.length === 0 && !isLoading ? (
          <div className="opacity-40 pl-4">- READY.</div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={m.role === 'assistant' ? 'mb-24' : ''} // Conditional margin after AI replies
            >
              <ChatMessage message={m} />
            </div>
          ))
        )}

         {/* Loading indicator */}
         {isLoading && messages[messages.length -1]?.role === 'user' && (
              <div className="opacity-70 pl-4">
                  {`${aiModelName}: `}
                  <span className={`inline-block bg-orange-400 w-2.5 h-4 ml-1 align-text-bottom ${cursorVisible ? 'opacity-100' : 'opacity-0'} animate-pulse`}></span>
              </div>
         )}
        {/* Anchor for scrolling - THIS is the target for scrollIntoView */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area Outer Container */}
      <div className="w-full border-t border-orange-700 sticky bottom-0 bg-black"> {/* Added sticky and bottom-0 */}
           {/* Input Area Inner Container */}
           <div className="w-full max-w-4xl py-4 pr-4">
               <form onSubmit={handleSubmit} className="flex items-center">
                   <span className="text-orange-400 mx-4">-</span>
                   <input
                       ref={inputRef}
                       value={input}
                       onChange={handleInputChange}
                       placeholder={isLoading ? "WAITING..." : "Type your message here..."}
                       className="flex-1 bg-transparent border-none outline-none text-orange-400 placeholder-orange-500 caret-orange-400"
                       disabled={isLoading}
                       autoFocus
                   />
                   <button type="submit" disabled={isLoading || !input} className="hidden"></button>
               </form>
           </div>
       </div>
   </div>
  );
}