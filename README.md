







There isn’t a real problem being solved here — OpenFoo simply offers an OpenFoo, new User interface for establishing a conversation with the LLM. It’s like a Winamp skin, but for a chat session.

LLM Chats reimagined.

We do believe it’s important to have a proper and personal way of communicating with the LLM.

GenFoo is an AI chat application with personalized interfaces. 

Each theme is designed to create a unique atmosphere for your AI conversations.

how to try:


option 1: 
got to openfoo.vercel.app then login using Google account


option 2: 
set clerk api keys (''CLERK_SECRET_KEY'' and ''NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'') in ''env.local'; 
set your ''OPENROUTER_API_KEY'' in ''env.local''














CODEBASE STRUCTURE:

project-root/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Main page component for the chat interface
│   │   └── layout.tsx
│   │   └── [chat-theme]/
│   │      │      └── page.tsx 
│   ├── api/    
│          │── chat/
│               │──route                     
│   └── components/ //                # Additional source files
│          │── themes/
│                 │──theme_1
│                 │──theme_2
│                 │──theme_n
├── public/                   # Static assets (images, etc.)
 
├── package.json              # Project dependencies and scripts
└── README.md                 # Project documentation.
