import { error, RequestEvent } from '@sveltejs/kit';
import { auth } from '$lib/auth';
import { db } from '$lib/data/db';
import { SavedTrip, savedTrip as savedTripsTable } from '$lib/data/schema';
import { and, eq } from 'drizzle-orm';

export async function DELETE(event: RequestEvent) {
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });

  if (!session) {
    throw error(401, 'Unauthorized');
  }

  const id = event.params.id;

  if (!id) {
    throw error(400, 'Bad Request');
  }

  const savedTrip = await db
    .delete(savedTripsTable)
    .where(and(eq(savedTripsTable.userId, session.user.id), eq(savedTripsTable.id, parseInt(id))));

  return Response.json(savedTrip);
}

export async function PATCH(event: RequestEvent) {
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });

  const id = event.params.id;

  if (!session) {
    throw error(401, 'Unauthorized');
  }

  if (!id) {
    throw error(400, 'Bad Request');
  }

  const body = (await event.request.json()) as Omit<
    SavedTrip,
    'id' | 'createdAt' | 'updatedAt' | 'userId'
  >;

  if (!body.sequence) {
    throw error(400, 'Sequence is required');
  }

  const savedTrip = await db
    .update(savedTripsTable)
    .set({
      sequence: body.sequence,
    })
    .where(and(eq(savedTripsTable.userId, session.user.id), eq(savedTripsTable.id, parseInt(id))))
    .returning();

  return Response.json(savedTrip);
}
