// src\app\order\success\page.tsx
import { stripe } from '@/lib/stripe';
import { redirect } from 'next/navigation';
import { ReadonlyURLSearchParams } from 'next/navigation'; // Import the type

type ExpectedSearchParams = {
    session_id?: string | string[];
    [key: string]: string | string[] | undefined;
};

// Use 'any' for the props parameter
export default async function SuccessPage(props: any) {

    // Assert the type of searchParams *inside* the function
    const searchParams = props.searchParams as ExpectedSearchParams;

    // You need to use .get() with ReadonlyURLSearchParams
    const sessionId = searchParams?.session_id;

    // .get() returns string | null, so adjust the check
    if (typeof sessionId !== 'string' || !sessionId) {
        console.error("SuccessPage: session_id is missing or invalid in searchParams.");
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold text-red-600 mb-4">Invalid Request</h1>
                <p className="mb-8">Could not process the request due to a missing payment session ID.</p>
            </div>
        );
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // --- Fulfillment should happen in the WEBHOOK ---
        // This page just confirms the status for the user.

        if (session.payment_status !== 'paid') {
            console.warn(`SuccessPage: Session ${sessionId} payment status is ${session.payment_status}.`);
            return (
                <div className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-3xl font-bold text-yellow-600 mb-4">Payment Processing</h1>
                    <p className="mb-8">Your payment is still confirming. Please wait a moment or check back later.</p>
                </div>
            );
        }

        // Payment is confirmed as 'paid'   
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold text-green-500 mb-4">Payment Successful</h1>
                <p className="mb-8 text-4xl">Thank you! Your order has been processed and you have now 1500 more credits.</p>
                <p><a href="/" className="text-blue-500 hover:underline">Go to Homepage</a></p>
            </div>
        );

    } catch (error) {
        console.error(`SuccessPage: Error retrieving or processing Stripe session ${sessionId}:`, error);
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold text-red-600 mb-4">Error Processing Payment</h1>
                <p className="mb-8">We encountered an issue while verifying your payment. Please contact support.</p>
            </div>
        );
    }
}