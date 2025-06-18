// src/components/themes/msn/MSNMessage.tsx
import React from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface MSNMessageProps {
  message: Message;
}

const MSNMessage: React.FC<MSNMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`
          max-w-[75%] p-2 rounded-md text-sm
          ${isUser
            ? 'bg-msn-user-bg text-msn-black border border-msn-grey-medium' // User message style
            : 'bg-msn-white text-msn-black border border-msn-grey-medium' // AI message style
          }
        `}
        // Optionally add font family: className="... font-msn"
      >
        {/* Optional: Display sender name (simplified here) */}
        <p className="font-semibold text-msn-blue text-xs mb-1">
          {isUser ? 'You:' : 'AI Assistant:'}
        </p>
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
};

export default MSNMessage;