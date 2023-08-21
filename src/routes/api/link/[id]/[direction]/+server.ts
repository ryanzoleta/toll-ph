import { db } from '$lib/data/db';
import { link, point } from '$lib/data/schema';
import { json, type RequestEvent } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export async function GET(event: RequestEvent) {
  const { id, direction } = event.params;

  if (id && direction) {
    const results = await db
      .select({ id: point.id, name: point.name, descriptor: point.descriptor })
      .from(link)
      .innerJoin(point, eq(link.nextPointId, point.id))
      .where(
        and(
          eq(link.originPointId, parseInt(id as string)),
          eq(
            link.direction,
            direction === 'NORTH' ? link.direction.enumValues[0] : link.direction.enumValues[1]
          )
        )
      );

    if (results) {
      return json(results);
    }

    return [];
  }

  return [];
}
