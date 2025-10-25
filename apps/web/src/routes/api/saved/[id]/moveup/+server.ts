import { error, RequestEvent } from '@sveltejs/kit';
import { auth } from '$lib/auth';
import { db } from '$lib/data/db';
import { savedTrip as savedTripsTable } from '$lib/data/schema';
import { and, eq } from 'drizzle-orm';

export async function POST(event: RequestEvent) {
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

  const tripToMoveUpResults = await db
    .select()
    .from(savedTripsTable)
    .where(and(eq(savedTripsTable.userId, session.user.id), eq(savedTripsTable.id, parseInt(id))))
    .orderBy(savedTripsTable.sequence)
    .limit(1);

  if (tripToMoveUpResults.length === 0) {
    throw error(404, 'Trip not found');
  }

  const tripToMoveUp = tripToMoveUpResults[0];

  if (tripToMoveUp.sequence === 1) {
    throw error(400, 'Trip is already at the top');
  }

  if (!tripToMoveUp) {
    throw error(404, 'Trip not found');
  }

  const tripToMoveDownResults = await db
    .select()
    .from(savedTripsTable)
    .where(
      and(
        eq(savedTripsTable.userId, session.user.id),
        eq(savedTripsTable.sequence, tripToMoveUp.sequence - 1)
      )
    )
    .orderBy(savedTripsTable.sequence)
    .limit(1);

  if (tripToMoveDownResults.length === 0) {
    throw error(404, 'Trip not found');
  }

  const tripToMoveDown = tripToMoveDownResults[0];

  if (!tripToMoveDown) {
    throw error(404, 'Trip not found');
  }

  await db
    .update(savedTripsTable)
    .set({
      sequence: tripToMoveDown.sequence,
    })
    .where(eq(savedTripsTable.id, tripToMoveUp.id));

  await db
    .update(savedTripsTable)
    .set({
      sequence: tripToMoveUp.sequence,
    })
    .where(eq(savedTripsTable.id, tripToMoveDown.id));

  return Response.json({ message: 'Trip moved up successfully' });
}
