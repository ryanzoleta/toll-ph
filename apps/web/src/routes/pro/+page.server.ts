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
  savedTrip as savedTripsTable,
  savedTrip,
  User,
} from '$lib/data/schema';
import { redirect, RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { POLAR_TOLL_PH_PRO_BENEFIT_ID, REDIS_URL } from '$env/static/private';
import Redis from 'ioredis';
import { getRemainingTrialDays } from '$lib/payments';

const redis = new Redis(REDIS_URL);

export async function load(event: RequestEvent) {
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });

  if (!session) {
    throw redirect(302, '/signin');
  }

  const user = session.user as User;

  const benefits = await auth.api.benefits({ headers: event.request.headers });
  const proBenefit = benefits.result.items.find(
    (benefit: any) => benefit.benefitId === POLAR_TOLL_PH_PRO_BENEFIT_ID
  );
  const isPro = proBenefit ? true : false;

  const remainingTrialDays = getRemainingTrialDays(user);
  if (remainingTrialDays <= 0) {
    throw redirect(302, '/paywall');
  }

  console.time('Loading pro page took');

  const dataFetchResults = await Promise.all([
    fetchPoints(),
    fetchExpressways(),
    fetchTollMatrix(),
    fetchConnections(),
    fetchSavedTrips(session.user.id),
  ]);
  const [points, expressways, tollMatrix, connections, savedTrips] = dataFetchResults;

  console.timeEnd('Loading pro page took');

  return {
    points,
    expressways,
    tollMatrix,
    connections,
    session,
    savedTrips,
    isPro,
  };
}

async function fetchPoints() {
  console.time('Fetching points took');

  const cachedPoints = await redis.get('load:points');

  let points: PointWithExpresswayAndNetwork[] = cachedPoints
    ? (JSON.parse(cachedPoints) as PointWithExpresswayAndNetwork[])
    : await db
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

  if (!cachedPoints) {
    await redis.set('load:points', JSON.stringify(points), 'EX', 60 * 60 * 24);
  }

  console.timeEnd('Fetching points took');

  return points;
}

async function fetchExpressways() {
  console.time('Fetching expressways took');

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
  console.timeEnd('Fetching expressways took');

  if (!cachedExpressways) {
    await redis.set('load:expressways', JSON.stringify(expressways), 'EX', 60 * 60 * 24);
  }

  return expressways;
}

async function fetchTollMatrix() {
  console.time('Fetching toll matrix took');

  const cachedMatrix = await redis.get('load:toll_matrix');

  const entryPoint = alias(point, 'entry_point');
  const exitPoint = alias(point, 'exit_point');

  const matrix: TollMatrixWithPoints[] = cachedMatrix
    ? (JSON.parse(cachedMatrix) as TollMatrixWithPoints[])
    : await db
        .select()
        .from(tollMatrix)
        .innerJoin(entryPoint, eq(tollMatrix.entryPointId, entryPoint.id))
        .innerJoin(exitPoint, eq(tollMatrix.exitPointId, exitPoint.id));
  console.timeEnd('Fetching toll matrix took');

  if (!cachedMatrix) {
    await redis.set('load:toll_matrix', JSON.stringify(matrix), 'EX', 60 * 60 * 24);
  }

  return matrix;
}

async function fetchConnections() {
  const connectingPoint = alias(point, 'connecting_point');
  const connectingExpressway = alias(expressway, 'connecting_expressway');
  const connectingTollNetwork = alias(tollNetwork, 'connecting_toll_network');

  console.time('Fetching connections took');

  const cachedConnections = await redis.get('load:connections');

  const connections: ConnectionWithPoints[] = cachedConnections
    ? (JSON.parse(cachedConnections) as ConnectionWithPoints[])
    : await db
        .select({
          connection,
          point: {
            id: point.id,
            name: point.name,
            expresswayId: point.expresswayId,
            expresswaySequence: expressway.sequence,
            sequence: point.sequence,
            tollNetworkId: expressway.tollNetworkId,
            rfid: tollNetwork.rfid,
          },
          connecting_point: {
            id: connectingPoint.id,
            name: connectingPoint.name,
            expresswayId: connectingPoint.expresswayId,
            expresswaySequence: connectingExpressway.sequence,
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
  console.timeEnd('Fetching connections took');

  if (!cachedConnections) {
    await redis.set('load:connections', JSON.stringify(connections), 'EX', 60 * 60 * 24);
  }

  return connections;
}

async function fetchSavedTrips(userId: string) {
  console.time('Fetching saved trips took');
  const savedTrips = await db
    .select()
    .from(savedTripsTable)
    .where(eq(savedTripsTable.userId, userId));
  console.timeEnd('Fetching saved trips took');
  return savedTrips;
}
