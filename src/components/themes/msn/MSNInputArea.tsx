// src/components/themes/msn/MSNInputArea.tsx
import React from 'react';

interface MSNInputAreaProps {
  inputValue: string;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: () => void;
  isLoading: boolean;
}

const MSNInputArea: React.FC<MSNInputAreaProps> = ({
  inputValue,
  onInputChange,
  onSendMessage,
  isLoading,
}) => {
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !isLoading) {
      event.preventDefault(); // Prevent newline on Enter
      onSendMessage();
    }
  };

  return (
    <div className="p-2 border-t border-msn-grey-medium bg-msn-grey-light flex items-center">
      <input
        type="text"
        value={inputValue}
        onChange={onInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Type your message here..."
        disabled={isLoading}
        className="flex-grow p-2 border border-msn-grey-dark bg-msn-white rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-msn-blue shadow-msn-inset disabled:bg-msn-grey-light"
        // Optionally add font family: className="... font-msn"
      />
      <button
        onClick={onSendMessage}
        disabled={isLoading || !inputValue.trim()}
        className="ml-2 px-4 py-2 bg-msn-green text-msn-white rounded-sm text-sm font-semibold border border-msn-grey-dark hover:bg-opacity-90 focus:outline-none focus:ring-1 focus:ring-msn-blue disabled:opacity-50 disabled:cursor-not-allowed"
        // Optionally add font family: className="... font-msn"
      >
        {isLoading ? 'Sending...' : 'Send'}
      </button>
      {/* Optional: Add placeholders for Font/Emoticon buttons */}
      {/* <button className="ml-1 p-1 border border-msn-grey-dark bg-msn-grey-light rounded-sm text-xs">A</button> */}
      {/* <button className="ml-1 p-1 border border-msn-grey-dark bg-msn-grey-light rounded-sm text-xs">😊</button> */}
    </div>
  );
};

export default MSNInputArea;