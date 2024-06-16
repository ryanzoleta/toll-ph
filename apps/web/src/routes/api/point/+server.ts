import { db } from '$lib/data/db';
import { link, point } from '$lib/data/schema';
import type { Point as OriginalPoint } from '$lib/data/schema';
import type { Point } from '$lib/types';
import { json, type RequestEvent } from '@sveltejs/kit';

export async function GET() {
  const points: OriginalPoint[] = await db
    .select()
    .from(point)
    .orderBy(point.expresswayId, point.sequence);
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
      return structuredClone(originalPoints.find((p) => p.id === id));
    }) as OriginalPoint[];

    const southQueryResults = alLinks.filter(
      (l) => l.originPointId === p.id && l.direction === 'SOUTH'
    );

    newPoint.nextSouthIds = southQueryResults.map((x) => {
      return x.nextPointId as number;
    });

    newPoint.nextSouths = newPoint.nextSouthIds.map((id) => {
      return structuredClone(originalPoints.find((p) => p.id === id));
    }) as OriginalPoint[];

    pointsExpanded.push(newPoint);
  }

  return json({
    points: pointsExpanded
  });
}

export async function POST(event: RequestEvent) {
  const body = await event.request.json();
  const { name, descriptor, expresswayId, entryable, exitable, sequence } = body;

  const newPoint = await db
    .insert(point)
    .values({ name, descriptor, expresswayId, entryable, exitable, sequence });

  return json(newPoint);
}
