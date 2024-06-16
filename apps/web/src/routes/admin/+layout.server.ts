import { db } from '$lib/data/db';
import { expressway, link, point, tollNetwork } from '$lib/data/schema';
import type { RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Point as OriginalPoint } from '$lib/data/schema';
import type { Point } from '$lib/types';

export async function load() {
  const tollNetworks = await db.select().from(tollNetwork);
  const expressways = await db.select().from(expressway);

  const points: OriginalPoint[] = await db.select().from(point).orderBy(point.sequence);
  const originalPoints = points;

  const pointsExpanded = [];

  const alLinks = await db.select().from(link);

  for (const p of points) {
    const newPoint = p as Point;

    const northQueryResults = alLinks.filter(
      (l) => l.originPointId === p.id && l.direction === 'NORTH'
    );

    newPoint.nextNorthIds = northQueryResults.map((x) => {
      return x.nextPointId as number;
    });

    newPoint.nextNorths = newPoint.nextNorthIds.map((id) => {
      return originalPoints.find((p) => p.id === id);
    }) as OriginalPoint[];

    const southQueryResults = alLinks.filter(
      (l) => l.originPointId === p.id && l.direction === 'SOUTH'
    );

    newPoint.nextSouthIds = southQueryResults.map((x) => {
      return x.nextPointId as number;
    });

    newPoint.nextSouths = newPoint.nextSouthIds.map((id) => {
      return originalPoints.find((p) => p.id === id);
    }) as OriginalPoint[];

    pointsExpanded.push(newPoint);
  }

  return {
    tollNetworks,
    expressways
  };
}

