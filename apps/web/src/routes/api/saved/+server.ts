import { error, RequestEvent } from '@sveltejs/kit';
import { auth } from '$lib/auth';
import { db } from '$lib/data/db';
import { SavedTrip, savedTrip as savedTripsTable } from '$lib/data/schema';
import { and, eq } from 'drizzle-orm';

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

export async function POST(event: RequestEvent) {
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });

  if (!session) {
    throw error(401, 'Unauthorized');
  }

  const body = (await event.request.json()) as Omit<SavedTrip, 'id' | 'createdAt' | 'updatedAt'>;

  const savedTrip = await db
    .insert(savedTripsTable)
    .values({
      userId: session.user.id,
      pointOriginId: body.pointOriginId,
      pointDestinationId: body.pointDestinationId,
      vehicleClass: body.vehicleClass,
    })
    .returning();

  return Response.json(savedTrip[0]);
}
