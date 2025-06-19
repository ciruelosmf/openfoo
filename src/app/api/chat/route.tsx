// app/api/chat/route.ts

 
import { google } from '@ai-sdk/google';
import { streamText } from "ai"; // Import StreamingTextResponse if needed directly

import { NextRequest, NextResponse } from 'next/server';
import { Message } from 'ai'; // We only need the Message type for the request body
import { auth } from '@clerk/nextjs/server';

// --- Environment Variable Check ---
if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY environment variable is not set");
}
const GOOGLE_KEY = process.env.GOOGLE_API_KEY;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_KEY && !GOOGLE_KEY) {
  throw new Error("Missing API Key: You must set either OPENROUTER_API_KEY or GOOGLE_API_KEY in your environment variables.");
}
 
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
 // 3. --- Conditional API Routing ---

    // ----- ROUTE 1: Use OpenRouter if key is present -----
    if (OPENROUTER_KEY) {
      console.log(`Using OpenRouter API with model: ${modelToUse}`);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.YOUR_SITE_URL || 'http://localhost:3000',
          "X-Title": process.env.YOUR_SITE_NAME || 'AI Chat App',
        },
        body: JSON.stringify({
          model: modelToUse,
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
      
      // Return the streaming response directly from OpenRouter
      return response;
    }

    // ----- ROUTE 2: Fallback to Google AI API -----
    else {
      console.log(`Using Google AI API with model: ${modelToUse}`);
      
      // Ensure the selected model is a Google model before proceeding
      if (!modelToUse.startsWith('google/')) {
        return NextResponse.json(
          { error: `The server is configured for Google AI, but you requested an invalid model: '${modelToUse}'. Please select a Google model.` },
          { status: 400 }
        );
      }
      
      // The AI SDK needs the model name without the 'google/' prefix.
      const googleModelName = modelToUse.replace('google/', '');

      const textStream = await streamText({
        // The SDK automatically uses the GOOGLE_API_KEY from environment variables
        model: google(googleModelName as any), // Cast to 'any' is safe here with our validation
        system: "You are a helpful and friendly AI assistant. Respond in Markdown format.",
        messages: cleanedMessages,
      });

      // Return the Vercel AI SDK stream response
      return textStream.toDataStreamResponse();
    }

  } catch (error: any) {
    console.error("--- UNEXPECTED ERROR IN API ROUTE ---", error);
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error.message}` },
      { status: 500 }
    );
  }
}