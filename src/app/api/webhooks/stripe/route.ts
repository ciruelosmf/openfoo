


// src/app/api/stripe/webhook/route.ts

import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe'; // Your Stripe client initialization

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);

// Define the structure of your user credits table row if needed elsewhere
export interface UserCreditRecord {
  id: number; // Assuming you have a primary key ID
  clerk_user_id: string;
  credits: number;
  created_at: Date;
  updated_at: Date;
}






 

// Define a mapping from Stripe Price ID to the number of credits
// IMPORTANT: Keep this consistent with your Stripe product setup!
const PRICE_ID_TO_CREDITS: { [key: string]: number } = {
  'price_1RJSmMPDeo7Oi8fOsbNCyK7b': 1200, // Example: 100 credits for this price
  'price_ANOTHER_PRICE_ID': 500, // Example: 500 credits for another price
    'price_1RUsLWANRlbGhFPPWgrdjWp5': 1200, // Example: 100 credits for this price

};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const h = await headers();
  const signature =  h.get('Stripe-Signature') as string;

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.error('Error: STRIPE_WEBHOOK_SECRET environment variable not set.');
    return NextResponse.json({ message: 'Webhook configuration error.' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    
  } catch (err: any) {
    console.error(`❌ Error verifying webhook signature: ${err.message}`);
    return NextResponse.json({ message: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
 

    const userId = session.metadata?.userId; // This is the clerk_user_id
    const priceId = session.metadata?.priceId;

    if (!userId) {
      console.error(`❌ Error: userId missing in metadata for session: ${session.id}`);
      return NextResponse.json({ message: 'User ID missing in session metadata.' }, { status: 400 });
    }

    let creditsToAdd: number | null = null;
    if (priceId && PRICE_ID_TO_CREDITS[priceId]) {
      creditsToAdd = PRICE_ID_TO_CREDITS[priceId];
 
    } else {
      console.warn(`⚠️ Warning: priceId '${priceId}' not found in metadata or mapping for session ${session.id}. Cannot determine credits automatically based on priceId.`);
       return NextResponse.json({ message: 'Could not determine credit amount from Price ID.' }, { status: 400 });
    }

    if (creditsToAdd === null || creditsToAdd <= 0) {
       console.error(`❌ Error: Could not determine a valid credit amount to add for session: ${session.id}`);
       return NextResponse.json({ message: 'Invalid credit amount determined.' }, { status: 400 });
    }

    // --- Neon Database Update Logic ---
    try {
 

      // Use Neon SQL to update the user's credits
      // This query assumes the user record ALREADY EXISTS in user_credits.
      // It updates the credits and the updated_at timestamp.
      const updateResult = await sql`
        UPDATE user_credits
        SET
          credits = credits + ${creditsToAdd},
          updated_at = NOW()
        WHERE clerk_user_id = ${userId}
      `;

  if (updateResult.length > 0) {
 
    // Proceed with logic assuming successful update
  } else {
    console.warn(`⚠️ No user found with clerk_user_id: ${userId} to update credits. 0 rows affected.`);
    // HERE YOU CAN DECIDE HOW TO HANDLE THIS:
    // 1. Log it and consider it "OK" if that's acceptable for your use case.
    // 2. Throw an error if this is an unexpected state:
    //    throw new Error(`Failed to update credits: User ${userId} not found.`);
    // 3. Send a specific response back if this is an API endpoint:
    //    return NextResponse.json({ error: `User ${userId} not found` }, { status: 404 });
  }
    } catch (dbError: any) {
      console.error(`❌ Database Error updating credits for clerk_user_id ${userId}: ${dbError.message}`);
      // Return 500 to indicate a server-side problem. Stripe will retry.
      return NextResponse.json(
        { message: 'Database update failed.' },
        { status: 500 }
      );
    }
    // --- End of Neon Database Update Logic ---

  } else {
    console.log(`🤷‍♀️ Received unhandled event type: `);
  }

  // Acknowledge receipt to Stripe
  return NextResponse.json({ received: true }, { status: 200 });
}

// We no longer need the separate placeholder function updateUserCreditsInDatabase
// as the logic is now directly inside the POST handler.