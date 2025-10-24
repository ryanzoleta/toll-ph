import { error, RequestEvent } from '@sveltejs/kit';
import { auth } from '$lib/auth';
import { db } from '$lib/data/db';
import { savedTrip as savedTripsTable } from '$lib/data/schema';
import { eq } from 'drizzle-orm';

export async function GET(event: RequestEvent) {
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });

  if (!session) {
    throw error(401, 'Unauthorized');
  }

  const savedTrips = await db
    .select()
    .from(savedTripsTable)
    .where(eq(savedTripsTable.userId, session.user.id));

  return Response.json(savedTrips);
}
