


There isn’t a real problem being solved here — OpenFoo simply offers an OpenFoo, new User interface for establishing a conversation with the LLM. It’s like a Winamp skin, but for a chat session.

LLM Chats reimagined.

We do believe it’s important to have a proper and personal way of communicating with the LLM.

GenFoo is an AI chat application with personalized interfaces. 

Each theme is designed to create a unique atmosphere for your AI conversations.
 


---------------------------------------
---------------------------------------
---------------------------------------



How to Run This Project

You can test this application via the live demo or by setting it up locally. For the competition, judges are encouraged to use the local setup with their own API keys.
1. Live Demo
Experience the deployed application instantly.


1. Visit	Go to openfoo.vercel.app
2. Log In	Authenticate using your Google account.
3. Chat	Start a conversation!
Note: The live demo uses a shared API key and may be subject to rate limits. For the full experience, please run the project locally.

2. Local Development (Recommended for Judges)
This method gives you full control and uses your personal API keys.
Clone & Install:

git clone  https://github.com/ciruelosmf/openfoo
cd openfoo
npm install


Configure Environment: Copy the example file to create your local configuration.


cp .env.example .env.local


Add Your API Keys: Edit the new .env.local file and add your secret keys.


# .env.local

# Authentication Provider (clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# AI Provider (openrouter.ai)
OPENROUTER_API_KEY="sk-or-..."


Launch:


npm run dev
Use code with caution.


The application will be available at http://localhost:3000.

---------------------------------------
---------------------------------------
---------------------------------------


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
