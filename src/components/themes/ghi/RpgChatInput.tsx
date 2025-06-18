// src/components/themes/rpg/RpgChatInput.tsx
import React from 'react';

interface RpgChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export default function RpgChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading
}: RpgChatInputProps) {
  return (
    // Form container styled as an RPG box
    <div className="bg-rpg-blue border-2 border-rpg-border p-3">
      <form onSubmit={handleSubmit} className="flex items-center">
        <span className="mr-2 text-rpg-text">{'>'}</span> {/* Prompt indicator */}
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder={isLoading ? "Awaiting response..." : "Enter command..."}
          className="flex-1 bg-transparent border-none outline-none text-rpg-text placeholder-rpg-text placeholder-opacity-70 font-rpg text-sm sm:text-base disabled:opacity-50"
          disabled={isLoading}
          autoFocus
        />
        {/* Optional: Submit button styled as part of the theme */}
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="ml-3 px-3 py-1 border border-rpg-border text-rpg-text bg-rpg-blue hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          SEND
        </button>
      </form>
    </div>
  );
}