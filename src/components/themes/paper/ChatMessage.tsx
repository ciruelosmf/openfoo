// components/ChatMessage.tsx
import { Message } from '@ai-sdk/react';
import React from 'react';

interface ChatMessageProps {
  message: Message;
  isLastMessage: boolean;
  isLoading: boolean;
  cursorVisible: boolean;
}

// Helper to roughly estimate lines based on typical character width
// This is a simplification. True character-width based line breaking is complex.
// We'll assume around 50-60 characters per "visual line" on the paper.
const CHARS_PER_LINE = 50; // Adjust this based on font and container width

function splitContentIntoLines(content: string, charsPerLine: number): string[] {
  const paragraphs = content.split('\n');
  const resultLines: string[] = [];
  paragraphs.forEach(paragraph => {
    if (paragraph.length === 0) {
      resultLines.push(''); // Preserve empty lines from newlines
      return;
    }
    let currentLine = '';
    const words = paragraph.split(' ');
    for (const word of words) {
      if ((currentLine + word).length > charsPerLine && currentLine.length > 0) {
        resultLines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    }
    if (currentLine.trim().length > 0) {
      resultLines.push(currentLine.trim());
    }
  });
  return resultLines;
}


export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLastMessage,
  isLoading,
  cursorVisible,
}) => {
  const isUser = message.role === 'user';
  // Split content into "visual lines" to apply the .paper-line style to each
  // This is a simplification; true text wrapping to fit lines is complex.
  // We'll primarily rely on natural text flow within a styled block,
  // but splitting by explicit newlines '\n' is essential.
  const contentLines = message.content.split('\n');

  // Determine indentation based on role, similar to "Dear Aunty Sal" vs "Norbert"
  const senderPrefix = isUser ? "Norbert:" : "Aunty Sal:"; // Or "You:", "AI:"
  const alignmentClass = isUser ? 'text-right' : 'text-left'; // For prefix and overall message block
  const indentClass = isUser ? 'double-indent' : 'indent'; // Example classes, translate to Tailwind margin/padding

  // For Norbert (user): double-indent (span left: 25ch)
  // For Aunty Sal (AI): indent (span left: 15ch)
  // The main text of the letter in the example is not indented, only the sign-off and salutation
  // We can apply indent to the whole message or just the prefix. Let's indent the whole message slightly.

  // Tailwind indentations:
  // For user: `ml-auto mr-[5ch]` (pushes text block left from right, then span is right aligned in it)
  // For AI: `ml-[5ch]` (pushes text block right from left)
  // Or, use the example's `ch` units for span positioning.
  // Let's use margin on the outer div of the message for overall placement.
  // The example `.indent span { left: 15ch; }` and `.double-indent span { left: 25ch; }`
  // We will apply margin to the overall message block.

  const messageBlockMargin = isUser ? 'ml-[20ch] sm:ml-[25ch]' : 'mr-[10ch] sm:mr-[15ch]';

  return (
    <div className={`mb-4 ${messageBlockMargin}`}>
      {/* Optional: Sender Prefix styled like a separate line */}
      <div className={`paper-line ${alignmentClass}`}>
        <span
          className={`paper-line-span font-semibold ${
            isUser ? 'right-2' : 'left-2'
          }`}
        >
          {senderPrefix}
        </span>
      </div>

      {contentLines.map((line, index) => (
        <div
          key={index}
          className={`paper-line ${alignmentClass} ${
            index === 0 && !isUser ? 'ml-[5ch]' : '' // Indent first line of AI like example
          } ${
            index === 0 && isUser ? 'ml-[5ch]' : '' // Indent first line of User slightly more (or handled by messageBlockMargin)
          }`}
        >
          <span
            className={`paper-line-span ${
              isUser ? 'right-2' : 'left-2'
            } ${
              index === 0 && !isUser ? 'ml-[5ch]' : '' // Match indent of line
            } ${
              index === 0 && isUser ? 'ml-[5ch]' : '' // Match indent of line
            }`}
          >
            {line}
            {isLastMessage &&
              message.role === 'assistant' &&
              isLoading &&
              index === contentLines.length - 1 && (
                <span className={cursorVisible ? 'opacity-100' : 'opacity-0'}>
                  ▋
                </span>
              )}
            {/* If line is empty, render a non-breaking space to maintain height */}
            {!line && <> </>}
          </span>
        </div>
      ))}
      {/* If AI is typing and there's no content yet, show a blinking cursor on its own line */}
      {isLastMessage && message.role === 'assistant' && isLoading && contentLines.join('').length === 0 && (
         <div className={`paper-line ${alignmentClass} ${!isUser ? 'ml-[5ch]' : ''}`}>
           <span className={`paper-line-span ${!isUser ? 'left-2 ml-[5ch]' : 'left-2'}`}>
              <span className={cursorVisible ? 'opacity-100' : 'opacity-0'}>▋</span>
           </span>
         </div>
      )}
    </div>
  );
};