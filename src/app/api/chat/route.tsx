// app/api/chat/route.ts

 

import { NextRequest, NextResponse } from 'next/server';
import { Message } from 'ai'; // We only need the Message type for the request body
import { auth } from '@clerk/nextjs/server';

// --- Environment Variable Check ---
if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY environment variable is not set");
}

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

// --- (THE FIX #1) Define your default model ---
// This is the model that will be used if the frontend doesn't specify one.
const DEFAULT_MODEL = 'google/gemini-2.5-flash';

const ALLOWED_MODELS = new Set([
    'google/gemini-2.5-flash',  
    'openai/o1-pro',
 
]);

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {

 
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

 

    // --- (THE FIX #3) Make `provider` optional ---
    // We expect the body to potentially have a `provider` key, but it might not.
    const body = await req.json();
    const messages: Message[] = body.messages;
    const clientModelId: string | undefined = body.provider; // This can be undefined

    // --- (THE FIX #4) Choose which model to use ---
    // If the client sent a modelId, use that. Otherwise, use our default.
    const modelToUse = clientModelId ?? DEFAULT_MODEL;

    // Now, validate the chosen model (whether it's the client's or our default).
    if (!ALLOWED_MODELS.has(modelToUse)) {
      return NextResponse.json({ error: `Model '${modelToUse}' is not supported.` }, { status: 400 });
    }

    // This cleaning step is still critical.
    const cleanedMessages = messages.map(({ role, content }) => ({
      role,
      content,
    }));

    // --- The Direct Fetch Implementation (unchanged) ---
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.YOUR_SITE_URL || 'http://localhost:3000',
        "X-Title": process.env.YOUR_SITE_NAME || 'My AI Chat App',
      },
      body: JSON.stringify({
        model: modelToUse, // Use the final chosen model here
        messages: cleanedMessages,
 
        stream: true, 
      })
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error("Error from OpenRouter API:", errorBody);
        return new NextResponse(JSON.stringify(errorBody), { 
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        });
    }

    return response;

  } catch (error: any) {
    console.error("--- UNEXPECTED ERROR IN API ROUTE ---", error);
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error.message}` },
      { status: 500 }
    );
  }
}