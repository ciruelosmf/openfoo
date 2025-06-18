// src/app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers'; // Keep this for origin if needed
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server'; // Correct import for App Router

interface RequestBody {
  priceId: string;
}

// Removed ResponseData/ErrorResponseData interfaces for simplicity,
// NextResponse handles typing well enough here.

export async function POST(request: NextRequest) {
 

  let userId: string | null = null; // Initialize userId

  // 1. Get Authenticated User ID using Clerk
  try {
    // Ensure auth() is called directly within the async function scope
    const authResult = await auth();
    userId = authResult.userId; // Extract userId from the result

 

    if (!userId) {
      console.error('Clerk auth() failed to return a userId.');
      return NextResponse.json({ message: 'Unauthorized: User ID not found.' }, { status: 401 });
    }

  } catch (error: any) {
      // Catch potential errors during auth() call itself
      console.error('Error calling Clerk auth():', error);
      // Log the specific error from Clerk if available
      if (error.message) {
          console.error('Clerk error message:', error.message);
      }
      return NextResponse.json({ message: 'Authentication Error' }, { status: 500 });
  }
 

  // 2. Get Request Body and Origin
  let priceId: string;
  let origin: string | null;
  try {
    const body: RequestBody = await request.json();
    priceId = body.priceId;

    const headersList = await headers(); // Get headers *after* potentially awaiting request.json()
    origin = headersList.get('origin');

    if (!priceId) {
        console.error('Error: priceId missing in request body.');
        return NextResponse.json({ message: 'Missing priceId in request body' }, { status: 400 });
    }
    if (!origin) {
        console.warn('Warning: Origin header missing. Success URL might be incomplete.');
        // Decide if you want to error out or proceed with a default/relative URL
        // For now, we'll proceed but log it.
    }
 

  } catch (error) {
    console.error('Error parsing request body or getting origin:', error);
    return NextResponse.json({ message: 'Invalid request data' }, { status: 400 });
  }


  // 3. Create Stripe Checkout Session WITH METADATA
  try {
 

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/tools/buycredits`, // Good practice to add cancel URL
      // === CRUCIAL PART ===
      metadata: {
        userId: userId, // Pass the verified userId here
        priceId: priceId, // Pass priceId as well (good practice)
      },
      // ===================
    });
 

    if (session.url) {
 
      return NextResponse.json({ url: session.url });
    } else {
      console.error('Stripe session URL is missing after creation.');
      return NextResponse.json(
        { message: 'Failed to create checkout session: Stripe URL missing.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error creating Stripe checkout session:', error);
    // Log the specific Stripe error if available
    if (error.message) {
        console.error('Stripe error message:', error.message);
    }
 
    return NextResponse.json(
      { message: 'Error creating checkout session' },
      { status: 500 }
    );
  }
}