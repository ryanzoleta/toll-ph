import { db } from '$lib/data/db';
import { expressway, point, tollNetwork, type Point } from '$lib/data/schema';

export async function load() {
  const tollNetworks = await db.select().from(tollNetwork);
  const expressways = await db.select().from(expressway);

  const points: Point[] = await db.select().from(point).orderBy(point.sequence);

  return {
    tollNetworks,
    expressways,
    points,
  };
}
