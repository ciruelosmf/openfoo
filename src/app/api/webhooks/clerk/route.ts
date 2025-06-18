 
import { NextResponse } from 'next/server';

import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { neon } from '@neondatabase/serverless';



// Interface for the email object within Clerk's payload
interface ClerkEmail {
  id: string;
  email_address: string;
  verification: { // Assuming this structure based on common Clerk payloads
    status: string;
    strategy: string;
  } | null; // Can be null if not verified or verification method differs
  // Add other properties if present and needed
}

// More specific interface for the data part of a 'user.created' event
interface UserCreatedEventData {
  id: string; // This is the Clerk User ID
  email_addresses: ClerkEmail[];
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  // Add any other properties you expect from the 'user.created' payload
  [key: string]: any; // Allows for other properties not explicitly defined
}





export async function POST(req: Request) {
    const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET
  
    if (!SIGNING_SECRET) {
      throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local')
    }
  
    // Create new Svix instance with secret
    const wh = new Webhook(SIGNING_SECRET)
  
    // Get headers
    const headerPayload = await headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')
  
    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response('Error: Missing Svix headers', {
        status: 400,
      })
    }
  
    // Get body
    const payload = await req.json()
    const body = JSON.stringify(payload)
  
    let evt: WebhookEvent
  
    // Verify payload with headers
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent
    } catch (err) {
      console.error('Error: Could not verify webhook:', err)
      return new Response('Error: Verification error', {
        status: 400,
      })
    }
  
    // Do something with payload
    // For this guide, log payload to console
    const { id } = evt.data
    const eventType = evt.type
    console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
    // console.log('Webhook payload:', body)
  



    // store payload in DB (users)
const sql = neon(process.env.DATABASE_URL!); // Add non-null assertion or check
 const initialCredits = parseInt(process.env.INITIAL_USER_CREDITS || '20', 10);

 if (eventType === "user.created") {
      const eventData = payload.data as UserCreatedEventData;

      const clerkUserId = eventData.id;
      if (!clerkUserId) {
          console.error("Clerk User ID missing in 'user.created' payload.data.id");
          return new Response('Error: Bad webhook payload - missing user ID', { status: 400 });
      }

      // Extract the primary email address
      // Clerk typically sends email_addresses as an array. The first one is usually the primary.
      let userEmail: string | null = null;
      if (eventData.email_addresses && eventData.email_addresses.length > 0) {
        userEmail = eventData.email_addresses[0].email_address;
      }
   try {
     // Optional but Recommended: Check if user already exists (idempotency)
     const existingUser = await sql`SELECT 1 FROM user_credits WHERE clerk_user_id = ${clerkUserId} LIMIT 1`;

     if (existingUser.length === 0) {
          await sql`
              INSERT INTO user_credits (clerk_user_id, credits, email)
              VALUES (${clerkUserId}, ${initialCredits}, ${userEmail})
          `;
          console.log(`Successfully inserted credits for user ${clerkUserId}`);
     } else {
         console.log(`User ${clerkUserId} already exists in credits table. Skipping insertion.`);
     }

   } catch (error) {
     console.error("Error inserting user credits into database:", error);
     // Consider returning 500 status if DB operation fails
     return new Response('Error: Database operation failed', { status: 500 });
   }
   console.log("Webhook processed successfully, sending 200 OK");
   return new NextResponse('', { status: 200 });
 }
}






