import { db } from '$lib/data/db';
import { connection, expressway, point, tollMatrix, tollNetwork } from '$lib/data/schema';
import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

export async function load() {
  const points = await db
    .select({
      id: point.id,
      name: point.name,
      expresswayId: point.expresswayId,
      sequence: point.sequence,
      tollNetworkId: expressway.tollNetworkId,
    })
    .from(point)
    .innerJoin(expressway, eq(point.expresswayId, expressway.id))
    .orderBy(point.expresswayId, point.sequence);

  const expressways = await db
    .select({
      id: expressway.id,
      name: expressway.name,
      tollNetworkId: expressway.tollNetworkId,
      rfid: tollNetwork.rfid,
    })
    .from(expressway)
    .innerJoin(tollNetwork, eq(tollNetwork.id, expressway.tollNetworkId));

  const entryPoint = alias(point, 'entry_point');
  const exitPoint = alias(point, 'exit_point');

  const matrix = await db
    .select()
    .from(tollMatrix)
    .innerJoin(entryPoint, eq(tollMatrix.entryPointId, entryPoint.id))
    .innerJoin(exitPoint, eq(tollMatrix.exitPointId, exitPoint.id));

  const connectingPoint = alias(point, 'connecting_point');
  const connectingExpressway = alias(expressway, 'connecting_expressway');

  const connections = await db
    .select({
      connection,
      point: {
        id: point.id,
        name: point.name,
        expresswayId: point.expresswayId,
        sequence: point.sequence,
        tollNetworkId: expressway.tollNetworkId,
      },
      connecting_point: {
        id: connectingPoint.id,
        name: connectingPoint.name,
        expresswayId: connectingPoint.expresswayId,
        sequence: connectingPoint.sequence,
        tollNetworkId: connectingExpressway.tollNetworkId,
      },
    })
    .from(connection)
    .innerJoin(point, eq(connection.pointId, point.id))
    .innerJoin(expressway, eq(point.expresswayId, expressway.id))
    .innerJoin(connectingPoint, eq(connection.connectingPointId, connectingPoint.id))
    .innerJoin(connectingExpressway, eq(point.expresswayId, expressway.id));

  return {
    points: points,
    expressways,
    tollMatrix: matrix,
    connections,
  };
}
