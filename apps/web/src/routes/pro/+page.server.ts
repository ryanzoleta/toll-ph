import { auth } from '$lib/auth';
import { db } from '$lib/data/db';
import {
  connection,
  expressway,
  point,
  PointWithExpresswayAndNetwork,
  ExpresswayWithNetwork,
  TollMatrixWithPoints,
  ConnectionWithPoints,
  tollMatrix,
  tollNetwork,
} from '$lib/data/schema';
import { redirect, RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { REDIS_URL } from '$env/static/private';
import Redis from 'ioredis';

const redis = new Redis(REDIS_URL);

export async function load(event: RequestEvent) {
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });

  if (!session) {
    throw redirect(302, '/signin');
  }

  console.debug('Querying points...');
  console.time('Querying points done after');

  const cachedPoints = await redis.get('load:points');

  let points: PointWithExpresswayAndNetwork[] = cachedPoints
    ? (console.log('using cached points'),
      JSON.parse(cachedPoints) as PointWithExpresswayAndNetwork[])
    : (console.log('not using cached points'),
      await db
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
        .orderBy(point.expresswayId, point.sequence));
  console.timeEnd('Querying points done after');

  if (!cachedPoints) {
    await redis.set('load:points', JSON.stringify(points), 'EX', 60 * 60 * 24);
  }

  console.debug('Querying expressways...');
  console.time('Querying expressways done after');

  const cachedExpressways = await redis.get('load:expressways');

  const expressways = cachedExpressways
    ? (JSON.parse(cachedExpressways) as ExpresswayWithNetwork[])
    : await db
        .select({
          id: expressway.id,
          name: expressway.name,
          tollNetworkId: expressway.tollNetworkId,
          rfid: tollNetwork.rfid,
        })
        .from(expressway)
        .innerJoin(tollNetwork, eq(tollNetwork.id, expressway.tollNetworkId))
        .orderBy(expressway.sequence);
  console.timeEnd('Querying expressways done after');

  if (!cachedExpressways) {
    await redis.set('load:expressways', JSON.stringify(expressways), 'EX', 60 * 60 * 24);
  }
  console.debug('Querying toll matrix...');
  console.time('Querying toll matrix done after');

  const cachedMatrix = await redis.get('load:toll_matrix');

  const entryPoint = alias(point, 'entry_point');
  const exitPoint = alias(point, 'exit_point');

  const matrix = cachedMatrix
    ? (JSON.parse(cachedMatrix) as TollMatrixWithPoints[])
    : await db
        .select()
        .from(tollMatrix)
        .innerJoin(entryPoint, eq(tollMatrix.entryPointId, entryPoint.id))
        .innerJoin(exitPoint, eq(tollMatrix.exitPointId, exitPoint.id));
  console.timeEnd('Querying toll matrix done after');

  if (!cachedMatrix) {
    await redis.set('load:toll_matrix', JSON.stringify(matrix), 'EX', 60 * 60 * 24);
  }

  const connectingPoint = alias(point, 'connecting_point');
  const connectingExpressway = alias(expressway, 'connecting_expressway');
  const connectingTollNetwork = alias(tollNetwork, 'connecting_toll_network');

  console.debug('Querying connections...');
  console.time('Querying connections done after');

  const cachedConnections = await redis.get('load:connections');

  const connections = cachedConnections
    ? (JSON.parse(cachedConnections) as ConnectionWithPoints[])
    : await db
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
  console.timeEnd('Querying connections done after');

  if (!cachedConnections) {
    await redis.set('load:connections', JSON.stringify(connections), 'EX', 60 * 60 * 24);
  }
  return {
    points: points,
    expressways,
    tollMatrix: matrix,
    connections,
    session,
  };
}
