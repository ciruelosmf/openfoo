// app/api/chat/route.ts
import { google } from '@ai-sdk/google';
import { streamText } from "ai"; // Import StreamingTextResponse if needed directly
import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server'; // Use NextResponse for standard responses

// --- Check for DATABASE_URL at the module level ---
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// --- Initialize Neon SQL instance outside the handler ---
const sql = neon(process.env.DATABASE_URL);

export const maxDuration = 30;

export async function POST(req: NextRequest) { // Use NextRequest for better typing
 











  

/*        




 













  


  const { userId } = await  auth();
  

  // 1. --- Authentication Check ---
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
 









  // userId is now guaranteed to be a string due to the check above
  // 2. --- Credit Check and Deduction ---
  try {


    // Check current credits - userId is definitely a string here
    const creditResult = await sql`
      SELECT credits FROM user_credits WHERE clerk_user_id = ${userId}
    `;

    if (creditResult.length === 0) {
      console.error(`User ${userId} not found in credits table. Webhook might have failed or is delayed.`);
      return NextResponse.json({ error: "Credit record not found. Please try again in a few seconds, or contact support." }, { status: 500 });
    }

    const currentCredits = creditResult[0].credits;

    // Check if credits are sufficient
    if (currentCredits <= 0) {
 
      return NextResponse.json({ error: "Insufficient credits - buy more credits at genfoo.com/buycredits" }, { status: 402 }); // 402 Payment Required is appropriate
    }

    // Deduct one credit - userId is definitely a string here
    const updateResult = await sql`
      UPDATE user_credits
      SET credits = credits - 1, updated_at = CURRENT_TIMESTAMP
      WHERE clerk_user_id = ${userId} AND credits > 0
      RETURNING credits
    `;

    if (updateResult.length === 0) {
      console.warn(`Failed to deduct credit for user ${userId} (likely race condition or already 0).`);
      return NextResponse.json({ error: "Insufficient credits. Buy more credits at genfoo.com/buycredits" }, { status: 402 });
    }

    const newCreditBalance = updateResult[0].credits;
 

  } catch (dbError: any) {
    console.error("Database error during credit check/deduction:", dbError.message || dbError); // Log message if available
    return NextResponse.json({ error: "Database error processing request" }, { status: 500 });
  }





 */










  

  // 3. --- Proceed with AI Interaction ---
  try {
    // IMPORTANT: Read the body *after* the credit check is successful
    const { messages } = await req.json();

    // Validate messages structure if necessary
    if (!Array.isArray(messages)) {
        return NextResponse.json({ error: "Invalid 'messages' format" }, { status: 400 });
    }

    const textStream = streamText({
        model: google("gemini-2.0-flash-001"), 
       //   model: google("gemini-2.5-pro-preview-05-06"), //   
      system: "You are an AI assistant.",
      messages,
    });

    // console.log("Sending messages to AI for user:", userId, messages); // More informative log
console.log("--- MESSAGES SENT TO AI ---");
console.log(JSON.stringify(messages, null, 2));
console.log("-----------------------------");
    // Return the Vercel AI SDK stream response
    return textStream.toDataStreamResponse();

  } catch (error: any) {
    console.error("Error in chat API after credit check:", error.message || error);
    let errorMessage = "Failed to process chat request";
    // Consider not exposing detailed internal errors to the client
    // if (error.message) errorMessage += `: ${error.message}`;
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}