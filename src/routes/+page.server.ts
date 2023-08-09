import { db } from '$lib/data/db';
import { point, type Point } from '$lib/data/schema';

export async function load() {
  const points: Point[] = await db.select().from(point);

  return {
    points
  };
}
