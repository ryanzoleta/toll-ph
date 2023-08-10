import { db } from '$lib/data/db';
import type { Point as OriginalPoint } from '$lib/data/schema';
import { expressway, link, point } from '$lib/data/schema';
import type { Point } from '$lib/types';
import { and, eq } from 'drizzle-orm';

export async function load() {
  const points: OriginalPoint[] = await db.select().from(point);

  const pointsExpanded = [];

  for (const p of points) {
    const newPoint = p as Point;

    const northQueryResults = await db
      .select({ id: link.nextPointId })
      .from(link)
      .where(and(eq(link.originPointId, p.id), eq(link.direction, 'NORTH')));

    newPoint.nextNorthIds = northQueryResults.map((x) => {
      return x.id as number;
    });

    const southQueryResults = await db
      .select({ id: link.nextPointId })
      .from(link)
      .where(and(eq(link.originPointId, p.id), eq(link.direction, 'SOUTH')));

    newPoint.nextSouthIds = southQueryResults.map((x) => {
      return x.id as number;
    });

    pointsExpanded.push(newPoint);
  }

  const expressways = await db.select().from(expressway);

  return {
    points: pointsExpanded,
    expressways
  };
}
