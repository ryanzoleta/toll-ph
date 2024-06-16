import { db } from '$lib/data/db';
import { expressway, point, tollMatrix } from '$lib/data/schema';
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
  console.log(tollMatrixResults);

  const points = await db
    .select()
    .from(point)
    .innerJoin(expressway, eq(point.expresswayId, expressway.id));

  return {
    tollMatrix: tollMatrixResults,
    points,
  };
}
