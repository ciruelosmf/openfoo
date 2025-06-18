// components/themes/teletext/TeletextChatMessage.tsx
import { Message } from 'ai';
import { useState, useEffect } from 'react';

interface TeletextChatMessageProps {
  message: Message;
  isLastMessage: boolean; // Is this the very last message in the list?
  isLoading: boolean;     // Is the AI currently generating a response?
}

// Simple typing effect (character by character)
const useTypingEffect = (text: string, speed = 20) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText(''); // Reset when text changes
    if (!text) return;

    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) {
        clearInterval(intervalId);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  return displayedText;
};


export function TeletextChatMessage({ message, isLastMessage, isLoading }: TeletextChatMessageProps) {
  const isUser = message.role === 'user';
  const textColor = isUser ? 'text-teletext-yellow' : 'text-teletext-cyan';
  const label = isUser ? 'YOU:' : 'P101 AI:'; // Example label with page number context
  const labelColor = isUser ? 'text-teletext-yellow' : 'text-teletext-cyan';

  // Apply typing effect only to the last AI message while loading
  const textToDisplay = (isLastMessage && message.role !== 'user' && isLoading)
    ? useTypingEffect(message.content)
    : message.content;

  // Blinking cursor state (managed locally for the last message)
  const [cursorVisible, setCursorVisible] = useState(true);
   useEffect(() => {
      if (isLastMessage && isLoading && message.role !== 'user') {
          const interval = setInterval(() => {
              setCursorVisible((prev) => !prev);
          }, 500); // Blinking speed
          return () => clearInterval(interval);
      } else {
          setCursorVisible(false); // Hide cursor if not the last loading AI message
      }
  }, [isLastMessage, isLoading, message.role]);

  // Determine if the cursor should be shown at the end of the text
   const showCursor = isLastMessage && isLoading && message.role !== 'user';


  return (
    <div className={`mb-4 font-teletext text-sm md:text-base leading-relaxed`}>
      {/* Use different colors for labels */}
      <span className={`${labelColor} font-bold mr-2`}>{label}</span>
      <span className={`${textColor} whitespace-pre-wrap`}>
        {textToDisplay}
        {showCursor && <span className={`ml-1 inline-block w-[1ch] h-[1.2em] ${cursorVisible ? 'bg-teletext-white' : 'bg-transparent'}`}></span>}
      </span>
    </div>
  );
}