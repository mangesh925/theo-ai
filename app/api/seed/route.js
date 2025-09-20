import { seedTransactions } from "@/actions/seed";
import aj from "@/lib/arcjet";
import { auth } from "@clerk/nextjs/server";

export async function GET(req) {
    // Get user ID for rate limiting
    const { userId } = await auth();
    
    // Apply Arcjet protection
    const decision = await aj.protect(req, { userId });
    
    if (decision.isDenied()) {
        return new Response("Forbidden", { status: 403 });
    }
    
    // Only allow seeding in development or for authenticated admin users
    if (process.env.NODE_ENV === 'production' && !userId) {
        return new Response("Unauthorized", { status: 401 });
    }
    
    const result = await seedTransactions();
    return Response.json(result);
}
