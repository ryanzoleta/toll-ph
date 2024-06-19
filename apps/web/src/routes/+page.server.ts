import { db } from '$lib/data/db';
import type { Point } from '$lib/data/schema';
import { expressway, point, tollMatrix, tollNetwork } from '$lib/data/schema';
import type { TollFeeMatrix } from '$lib/types';
import { eq } from 'drizzle-orm';

export async function load() {
  const points: Point[] = await db.select().from(point).orderBy(point.expresswayId, point.sequence);

  const expressways = await db
    .select({
      id: expressway.id,
      name: expressway.name,
      tollNetworkId: expressway.tollNetworkId,
      rfid: tollNetwork.rfid,
    })
    .from(expressway)
    .innerJoin(tollNetwork, eq(tollNetwork.id, expressway.tollNetworkId));

  const matrix = await db.select().from(tollMatrix);
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
      fee: parseFloat(t.fee as string),
    });
  }

  return {
    points: points,
    expressways,
    tollFeeMatrix,
  };
}
