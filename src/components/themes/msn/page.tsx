// src/components/themes/msn/page.tsx
'use client'; // This component uses hooks

import React, { useState, useRef, useEffect, useCallback } from 'react';
import MSNHeader from './MSNHeader';
import MSNMessage from './MSNMessage';
import MSNInputArea from './MSNInputArea';

// Define the message structure
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const MSNMessengerTheme: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // --- Scroll Logic ---
   useEffect(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      // Scroll to bottom only if the last message was added by the user
      // or if the container was already scrolled near the bottom before AI response
      // This prevents auto-scroll if user scrolled up to read history

      const isScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 30; // Add tolerance
      const lastMessageIsUser = messages.length > 0 && messages[messages.length - 1].role === 'user';

      if (lastMessageIsUser || isScrolledToBottom) {
          const timer = setTimeout(() => {
              container.scrollTop = container.scrollHeight;
          }, 50); // Small delay to allow render

          return () => clearTimeout(timer);
      }
  }, [messages]); // Depend on messages array


  // --- Input Change Handler ---
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  // --- Send Message Handler ---
  const handleSendMessage = useCallback(async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    const newUserMessage: Message = { role: 'user', content: trimmedInput };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    // --- API Call Simulation ---
    // Replace this with your actual API call logic
    try {
      // console.log('Sending to API:', trimmedInput); // For debugging
      // const response = await fetch('/api/chat', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message: trimmedInput, history: messages }), // Send history if needed
      // });
      // if (!response.ok) {
      //   throw new Error('API request failed');
      // }
      // const data = await response.json();
      // const aiResponseContent = data.reply; // Adjust based on your API response structure

      // --- Placeholder Response ---
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      const aiResponseContent = `This is a simulated AI response to "${trimmedInput}". In a real app, this would come from the backend.`;
      // --- End Placeholder ---


      const newAiMessage: Message = { role: 'assistant', content: aiResponseContent };
      setMessages((prevMessages) => [...prevMessages, newAiMessage]);

    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMesssage: Message = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages((prevMessages) => [...prevMessages, errorMesssage]);
    } finally {
      setIsLoading(false);
    }
     // --- End API Call ---

  }, [inputValue, isLoading, messages]); // Include messages if sending history

  return (
    // Outer container to center the "window" and provide a backdrop
    <div className="flex justify-center items-center h-full bg-msn-grey-light p-4">
       {/* MSN Window Simulation */}
      <div className="w-full max-w-2xl h-[70vh] flex flex-col bg-msn-grey-light border border-msn-grey-dark shadow-msn-window">
        <MSNHeader />

        {/* Message Display Area */}
        <div
          ref={scrollContainerRef}
          className="flex-grow overflow-y-auto bg-msn-white p-4 space-y-2 border-t border-msn-grey-medium border-b"
        >
          {messages.length === 0 && (
             <p className="text-center text-msn-grey-dark text-sm">Start chatting with the AI!</p>
          )}
          {messages.map((msg, index) => (
            <MSNMessage key={index} message={msg} />
          ))}
           {/* Optional: Typing indicator */}
           {isLoading && messages[messages.length - 1]?.role === 'user' && (
             <div className="flex justify-start mb-2">
                <div className="bg-msn-white text-msn-black border border-msn-grey-medium p-2 rounded-md text-sm italic">
                    AI Assistant is typing...
                </div>
             </div>
            )}
        </div>

        {/* Input Area */}
        <MSNInputArea
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
        {/* Optional Status Bar */}
        {/* <div className="text-xs p-1 border-t border-msn-grey-dark bg-msn-grey-light text-msn-grey-dark">
          Connected
        </div> */}
      </div>
    </div>
  );
};

export default MSNMessengerTheme;