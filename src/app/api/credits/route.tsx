 // \src\app\api\credits\route.tsx
import { auth } from '@clerk/nextjs/server'; // Import Clerk's auth function
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';





// Define the expected shape of the data returned by the query
interface CreditData {
  credits: number;
  updated_at: Date; // Neon automatically parses TIMESTAMPTZ to Date objects
}
const sql = neon(process.env.DATABASE_URL!); // Add non-null assertion or check

export async function GET(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Use Neon SQL and type the expected result array
    const result = await sql`
      SELECT credits, updated_at
      FROM user_credits
      WHERE clerk_user_id = ${userId}
    `;

    if (result.length === 0) {
      console.warn(`Credit record not found for user ${userId} during GET request.`);
      return NextResponse.json({ error: 'Credit record not found' }, { status: 404 });
      // Or return default: return NextResponse.json({ credits: 100, updatedAt: new Date() });
    }

    const data = result[0]; // Get the first row

    // Return the data - Neon should handle Date serialization correctly for JSON
    return NextResponse.json({
      credits: data.credits,
      updatedAt: data.updated_at, // Send timestamp as ISO string or let NextResponse handle it
    });

  } catch (error) {
    console.error('Error fetching user credits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}