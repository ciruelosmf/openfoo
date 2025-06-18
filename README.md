

crt style
https://codepen.io/Grilly86/pen/pNvXxp

https://codepen.io/mortydk/pen/xxGrPRP































Help me develop an AI chatbot app. Main feature is to select one among many UIs (graphical user interface) for the chat session, instead of the deafult one by many AI vendors (the gray toned one).
Please provide code for the following UI theme for an AI chatbot application: '''

MSN Messenger from the 2000s

'''.

Additional Requirements:
NEXTJS.
Each theme must work with a single Tailwind configuration file.
All themes must adapt to the same base layout file structure.
Components should be designed to allow theme switching without changing the layout.
Each theme must be implemented as modular, swappable components (EXMAPLE: ''// src/components/themes/msn_messenger/MSNMessengerTheme.tsx'').
Components should be self-contained but able to communicate with the main application.
Assume the api call logic works fine and its implmentation stable and defined.
Assume there is way to drive all themes code ([chat-theme]/page.tsx ).

CODEBASE STRUCTURE:
'''
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
'''.

CODE CONTEXT :


'''typescript



'''.