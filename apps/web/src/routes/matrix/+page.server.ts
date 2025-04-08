import { db } from '$lib/data/db';
import { expressway, point, tollMatrix, tollNetwork } from '$lib/data/schema';
import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

export async function load() {
  const entryPoint = alias(point, 'entryPoint');
  const exitPoint = alias(point, 'exitPoint');
  const entryExpressway = alias(expressway, 'entryExpressway');
  const exitExpressway = alias(expressway, 'exitExpressway');

  const tollMatrixResults = await db
    .select()
    .from(tollMatrix)
    .innerJoin(entryPoint, eq(tollMatrix.entryPointId, entryPoint.id))
    .innerJoin(exitPoint, eq(tollMatrix.exitPointId, exitPoint.id))
    .innerJoin(entryExpressway, eq(entryPoint.expresswayId, entryExpressway.id))
    .innerJoin(exitExpressway, eq(exitPoint.expresswayId, exitExpressway.id));

  const points = await db
    .select()
    .from(point)
    .innerJoin(expressway, eq(point.expresswayId, expressway.id));

  const tollNetworks = await db.select().from(tollNetwork);

  const expressways = await db.select().from(expressway);

  return {
    tollMatrix: tollMatrixResults,
    points,
    tollNetworks: tollNetworks.sort((a, b) => (a.sequence || 0) - (b.sequence || 0)),
    expressways,
  };
}
