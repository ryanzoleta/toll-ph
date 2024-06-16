import { db } from '$lib/data/db';
import { link } from '$lib/data/schema';
import { json, type RequestEvent } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export async function DELETE(event: RequestEvent) {
  const { id, nextId, direction } = event.params;

  await db
    .delete(link)
    .where(
      and(
        eq(link.originPointId, parseInt(id as string)),
        eq(link.nextPointId, parseInt(nextId as string)),
        eq(
          link.direction,
          direction === 'NORTH' ? link.direction.enumValues[0] : link.direction.enumValues[1]
        )
      )
    );

  return json('ok');
}

export async function POST(event: RequestEvent) {
  const { id, nextId, direction } = event.params;

  if (id && nextId && direction) {
    await db.insert(link).values({
      originPointId: parseInt(id as string),
      nextPointId: parseInt(nextId as string),
      direction: direction === 'NORTH' ? link.direction.enumValues[0] : link.direction.enumValues[1]
    });
  }

  return json('ok');
}
