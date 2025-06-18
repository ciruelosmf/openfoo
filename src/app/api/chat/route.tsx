// app/api/chat/route.ts

// --- (CORRECT) Import from the official OpenRouter provider and the AI SDK core ---
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { CoreMessage, streamText, Message } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
// --- Environment Variable Check ---
if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY environment variable is not set");
}

// --- (CORRECT) Instantiate the provider using the official function ---
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  // The headers are not needed here as the provider handles them,
  // but you can add them if you have specific needs.
});

// Your whitelist of models. Ensure these are correct on OpenRouter.
const ALLOWED_MODELS = new Set([
    'google/gemini-2.5-flash',
 
 
]);
 
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { messages, provider: modelId }: { messages: Message[], provider: string } = await req.json();

    if (!ALLOWED_MODELS.has(modelId)) {
      return NextResponse.json({ error: `Model '${modelId}' is not supported.` }, { status: 400 });
    }

    // --- (CRITICAL FIX - THIS IS STILL REQUIRED) ---
    // The `useChat` hook sends extra data (`id`, `parts`, etc.).
    // We MUST clean the messages to send ONLY `role` and `content`
    // to prevent OpenRouter from rejecting the request.
    const cleanedMessages = messages.map(({ role, content }) => ({
      role,
      content,
    }));

    // --- (THE DIRECT FETCH IMPLEMENTATION) ---
    // This uses the Web Fetch API directly, as per your request.
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
        // Optional headers from the docs
        "HTTP-Referer": process.env.YOUR_SITE_URL || 'http://localhost:3000',
        "X-Title": process.env.YOUR_SITE_NAME || 'My AI Chat App',
      },
      body: JSON.stringify({
        model: modelId,
        messages: cleanedMessages,
        // --- THIS IS THE MAGIC KEY TO MAKE IT STREAM ---
        stream: true, 
      })
    });

    // --- (IMPORTANT) Check for errors from OpenRouter before streaming ---
    // If the API key is wrong or the model is invalid, OpenRouter will send an error immediately.
    if (!response.ok) {
        const errorBody = await response.json();
        console.error("Error from OpenRouter API:", errorBody);
        return NextResponse.json(errorBody, { status: response.status });
    }

    // --- Return the streaming response directly to the client ---
    // The Next.js App Router can directly return a `Response` object.
    // This will correctly proxy the headers and the streaming body to your `useChat` hook.
    return response;

  } catch (error: any) {
    console.error("--- UNEXPECTED ERROR IN API ROUTE ---", error);
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error.message}` },
      { status: 500 }
    );
  }
}