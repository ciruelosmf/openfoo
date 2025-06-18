// src/app/theme/[chat-theme]/page.tsx

import { use } from 'react';
import { notFound } from 'next/navigation';

// Import the new RPG theme page component
import RpgThemePage from '@/components/themes/rpg/page';
import HackerUI from '@/components/themes/h/page';
import Chat from '@/components/themes/appleii/page';
import Gho from '@/components/themes/ghosthy/page';
import TeletextPage from '@/components/themes/teletext/page';
import VintageTerminalChat from '@/components/themes/8008/page';
import Theme1ChatPage from '@/components/themes/ghi/page';
 
import ConsChatPage from '@/components/themes/cons/page'; // Adjust path if needed
import LetterChatPage from '@/components/themes/letter/page'; // Adjust path if needed
import ChatPage from '@/components/themes/paper/page'; // Adjust path if needed
import SpreadsheetTheme from '@/components/themes/spread/page'; // Adjust path if needed
import SprodsheetTheme from '@/components/themes/sprod/page'; // Adjust path if needed
import t from '@/components/themes/test_t/page'; // Adjust path if needed
import t2 from '@/components/themes/test_t2/page'; // Adjust path if needed

// ... import other themes if you have them


import ThemePageWrapper from '@/components/ThemePageWrapper'; // Adjust path if needed


const themeComponents: { [key: string]: React.ComponentType<any> } = {
  // Add the rpg theme - use a simple key for the URL
  rpg: RpgThemePage,
  hackerui: HackerUI,
  appleii: Chat,
  ghosthy: Gho,
  teletext: TeletextPage,
  8008: VintageTerminalChat,
  ghi: Theme1ChatPage,
 
  cons: ConsChatPage,
  letter: LetterChatPage,
  paper: ChatPage,
spread: SpreadsheetTheme,
sprod: SprodsheetTheme,
test_t:t,
test_t2:t2,

  // Add other themes here
};

export default async function ChatThemePage({ params }: { params: Promise<{ 'chat-theme': string }> }) {
  const resolvedParams = await params;
  // Ensure correct key access if using hyphens in URL, or stick to simple names
  const themeKey = resolvedParams['chat-theme']; // Use bracket notation

  console.log("Attempting to load theme:", themeKey); // Good for debugging

  const SelectedChatComponent = themeComponents[themeKey];

  if (!SelectedChatComponent) {
      console.error(`Theme component not found for key: ${themeKey}`); // Debug log
      notFound();
  }

  return     <ThemePageWrapper>
  <SelectedChatComponent />
</ThemePageWrapper>
  ;
}