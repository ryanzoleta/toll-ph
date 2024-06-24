import { db } from '$lib/data/db';
import type { Point } from '$lib/data/schema';
import { connection, expressway, point, tollMatrix, tollNetwork } from '$lib/data/schema';
import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

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

  const connectingPoint = alias(point, 'connectingPoint');

  const connections = await db
    .select()
    .from(connection)
    .innerJoin(point, eq(connection.pointId, point.id))
    .innerJoin(connectingPoint, eq(connection.connectingPointId, connectingPoint.id));

  return {
    points: points,
    expressways,
    tollMatrix: matrix,
    connections,
  };
}
