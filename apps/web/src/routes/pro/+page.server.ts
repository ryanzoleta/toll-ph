import { auth } from '$lib/auth';
import { db } from '$lib/data/db';
import { connection, expressway, point, tollMatrix, tollNetwork } from '$lib/data/schema';
import { redirect, RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

export async function load(event: RequestEvent) {
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });

  if (!session) {
    throw redirect(302, '/signin');
  }

  console.debug('Querying points...');
  const points = await db
    .select({
      id: point.id,
      name: point.name,
      expresswayId: point.expresswayId,
      expresswaySequence: expressway.sequence,
      sequence: point.sequence,
      tollNetworkId: expressway.tollNetworkId,
      rfid: tollNetwork.rfid,
    })
    .from(point)
    .innerJoin(expressway, eq(point.expresswayId, expressway.id))
    .innerJoin(tollNetwork, eq(expressway.tollNetworkId, tollNetwork.id))
    .orderBy(point.expresswayId, point.sequence);
  console.debug('Points queried, found', points.length);

  console.debug('Querying expressways...');
  const expressways = await db
    .select({
      id: expressway.id,
      name: expressway.name,
      tollNetworkId: expressway.tollNetworkId,
      rfid: tollNetwork.rfid,
    })
    .from(expressway)
    .innerJoin(tollNetwork, eq(tollNetwork.id, expressway.tollNetworkId))
    .orderBy(expressway.sequence);
  console.debug('Expressways queried, found', expressways.length);

  console.debug('Querying toll matrix...');
  const entryPoint = alias(point, 'entry_point');
  const exitPoint = alias(point, 'exit_point');

  const matrix = await db
    .select()
    .from(tollMatrix)
    .innerJoin(entryPoint, eq(tollMatrix.entryPointId, entryPoint.id))
    .innerJoin(exitPoint, eq(tollMatrix.exitPointId, exitPoint.id));
  console.debug('Toll matrix queried, found', matrix.length);

  const connectingPoint = alias(point, 'connecting_point');
  const connectingExpressway = alias(expressway, 'connecting_expressway');
  const connectingTollNetwork = alias(tollNetwork, 'connecting_toll_network');

  console.debug('Querying connections...');
  const connections = await db
    .select({
      connection,
      point: {
        id: point.id,
        name: point.name,
        expresswayId: point.expresswayId,
        sequence: point.sequence,
        tollNetworkId: expressway.tollNetworkId,
        rfid: tollNetwork.rfid,
      },
      connecting_point: {
        id: connectingPoint.id,
        name: connectingPoint.name,
        expresswayId: connectingPoint.expresswayId,
        sequence: connectingPoint.sequence,
        tollNetworkId: connectingExpressway.tollNetworkId,
        rfid: connectingTollNetwork.rfid,
      },
    })
    .from(connection)
    .innerJoin(point, eq(connection.pointId, point.id))
    .innerJoin(expressway, eq(point.expresswayId, expressway.id))
    .innerJoin(tollNetwork, eq(expressway.tollNetworkId, tollNetwork.id))
    .innerJoin(connectingPoint, eq(connection.connectingPointId, connectingPoint.id))
    .innerJoin(connectingExpressway, eq(connectingPoint.expresswayId, connectingExpressway.id))
    .innerJoin(
      connectingTollNetwork,
      eq(connectingExpressway.tollNetworkId, connectingTollNetwork.id)
    );
  console.debug('Connections queried, found', connections.length);

  return {
    points: points,
    expressways,
    tollMatrix: matrix,
    connections,
    session,
  };
}
