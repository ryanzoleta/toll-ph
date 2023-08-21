import { db } from '$lib/data/db';
import type { Point as OriginalPoint } from '$lib/data/schema';
import { expressway, link, point, tollMatrix } from '$lib/data/schema';
import type { Point, TollFeeMatrix } from '$lib/types';

export async function load() {
  console.time('points_query');
  const points: OriginalPoint[] = await db
    .select()
    .from(point)
    .orderBy(point.expresswayId, point.sequence);
  console.timeEnd('points_query');

  const pointsExpanded = [];

  console.time('links_query');

  const alLinks = await db.select().from(link);

  for (const p of points) {
    const newPoint = p as Point;

    const northQueryResults = alLinks.filter(
      (l) => l.originPointId === p.id && l.direction === 'NORTH'
    );

    newPoint.nextNorthIds = northQueryResults.map((x) => {
      return x.nextPointId as number;
    });

    const southQueryResults = alLinks.filter(
      (l) => l.originPointId === p.id && l.direction === 'SOUTH'
    );

    newPoint.nextSouthIds = southQueryResults.map((x) => {
      return x.nextPointId as number;
    });

    pointsExpanded.push(newPoint);
  }

  console.timeEnd('links_query');

  console.time('expressways_query');
  const expressways = await db.select().from(expressway);
  console.timeEnd('expressways_query');

  console.time('matrix_query');
  const matrix = await db.select().from(tollMatrix);
  console.timeEnd('matrix_query');
  const tollFeeMatrix: TollFeeMatrix[] = [];

  for (const t of matrix) {
    let determinantList = [];

    determinantList.push(t.entryPointId);
    if (t.entryPointId !== t.exitPointId) determinantList.push(t.exitPointId);
    if (t.entryPointId !== 99999 && t.exitPointId !== 99999)
      determinantList = determinantList.sort();

    const determinants = determinantList.join(',');

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
