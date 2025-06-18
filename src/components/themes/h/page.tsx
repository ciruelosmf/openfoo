'use client'; // Required if using hooks like useState, useEffect or event handlers

import React, { useState } from 'react';

// In the future, you would import and use your chat logic hook here
// import useChatLogic from '@/hooks/useChatLogic';

export default function HackerUI() {
  // const { messages, input, handleInputChange, handleSubmit, isLoading } = useChatLogic();
  // Placeholder state for demonstration
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '[[System ONLINE]] :: Welcome, user. State your query.' },
    { role: 'user', content: 'Tell me about Next.js' },
    { role: 'assistant', content: '[[Processing...]] :: Next.js is a React framework for production...' },
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (!input.trim()) return;
     console.log('Submitting (HackerUI):', input);
     // Add message to state (placeholder logic)
     setMessages([...messages, { role: 'user', content: input }]);
     // TODO: Call actual AI API via useChatLogic hook
     setInput('');
     // TODO: Show loading state
     // TODO: Add AI response later
  };


  return (
    <div className="flex flex-col h-screen bg-hacker-bg text-hacker-green font-mono p-4">
      <div className="flex-grow overflow-y-auto mb-4 border border-hacker-green/30 p-2">
        {/* Message display area */}
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
             <span className={`inline-block p-1 px-2 ${msg.role === 'user' ? 'bg-blue-900/30' : 'bg-green-900/30'}`}>
                {msg.role === 'user' ? '>> ' : '<< '} {msg.content}
             </span>
          </div>
        ))}
         {/* Placeholder for loading indicator */}
         {/* {isLoading && <div className="text-center animate-pulse">[[ ... ]]</div>} */}
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-hacker-green/50 pt-4">
        <span className="text-hacker-green self-center">{'>'}</span>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Enter command..."
          className="flex-grow bg-transparent border border-hacker-green/50 focus:border-hacker-green focus:ring-0 outline-none px-2 py-1 caret-hacker-green"
          autoFocus
        />
        <button
          type="submit"
          className="bg-hacker-green/80 text-hacker-bg font-bold px-4 py-1 hover:bg-hacker-green disabled:opacity-50"
          // disabled={isLoading || !input.trim()}
        >
          SEND
        </button>
      </form>
    </div>
  );
}