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
