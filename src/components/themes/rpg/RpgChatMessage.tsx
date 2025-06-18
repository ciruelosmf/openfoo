// src/components/themes/rpg/RpgChatMessage.tsx
import { Message } from 'ai';
import Image from 'next/image'; // Import Next.js Image component

// Define the props for the component
interface RpgChatMessageProps {
  message: Message;
  isLastMessage: boolean;
  isLoading: boolean;
}

// Placeholder for blinking cursor (can be refined)
const BlinkingCursor = () => (
  <span className="inline-block w-2 h-4 bg-rpg-text ml-1 animate-pulse"></span>
);

export default function RpgChatMessage({ message, isLastMessage, isLoading }: RpgChatMessageProps) {
  const isUser = message.role === 'user';
  const isAi = message.role === 'assistant' || message.role === 'system'; // Handle both AI roles

  // Basic word wrap logic (can be improved for better pixel rendering)
  const formatMessageContent = (content: string) => {
      // Replace newlines with <br /> for rendering
      // You might need more complex logic for true pixel-perfect wrapping
      return content.split('\n').map((line, i) => (
          <span key={i}>
              {line}
              <br />
          </span>
      ));
  };

  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* RPG Text Box for AI messages */}
      {isAi && (
        <div className="flex items-start max-w-xl lg:max-w-2xl">
           {/* AI Avatar */}
           <div className="flex-shrink-0 mr-3 mt-1">
             {/* Use Next/Image for optimized loading */}
             <Image
               src="/pixel-avatar.png" // Path to your avatar in /public
               alt="AI Avatar"
               width={40} // Adjust size as needed
               height={40}
               className="border border-rpg-border bg-rpg-avatar-bg" // Simple border/bg
               unoptimized // Prevent optimization that might blur pixel art
             />
           </div>

           {/* Message Box */}
           <div className="bg-rpg-blue border-2 border-rpg-border p-3 text-sm sm:text-base leading-snug">
             {/* Optional: AI Name */}
             {/* <p className="font-bold mb-1 text-yellow-300">Mystic Oracle:</p> */}
              <div className="whitespace-pre-wrap break-words">
                 {formatMessageContent(message.content)}
                 {/* Show blinking cursor at the end of the last AI message while loading */}
                 {isLastMessage && isLoading && <BlinkingCursor />}
              </div>
           </div>
        </div>
      )}

      {/* Simpler display for User messages */}
      {isUser && (
        <div className="max-w-xl lg:max-w-2xl">
            {/* You could add a user box too, maybe aligned right & different color */}
            {/* For simplicity, just showing text */}
            <div className="bg-gray-700 border-2 border-gray-500 p-3 text-sm sm:text-base leading-snug">
                 <p className="text-blue-300 mb-1 font-bold text-right">:You</p>
                 <div className="whitespace-pre-wrap break-words text-right">
                     {formatMessageContent(message.content)}
                 </div>
            </div>
        </div>
      )}
    </div>
  );
}