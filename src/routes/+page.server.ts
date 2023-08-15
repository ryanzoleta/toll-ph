import { db } from '$lib/data/db';
import type { Point as OriginalPoint } from '$lib/data/schema';
import { expressway, link, point, tollMatrix } from '$lib/data/schema';
import type { Point, TollFeeMatrix } from '$lib/types';
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

  const matrix = await db.select().from(tollMatrix);
  const tollFeeMatrix: TollFeeMatrix[] = [];

  for (const t of matrix) {
    const determinantList = [];

    determinantList.push(t.entryPointId);
    if (t.entryPointId !== t.exitPointId) determinantList.push(t.exitPointId);

    const determinants = determinantList.sort().join(',');

    tollFeeMatrix.push({
      determinants: determinants,
      fee: parseFloat(t.fee as string)
    });
  }

  return {
    points: pointsExpanded,
    expressways,
    tollFeeMatrix
  };
}
