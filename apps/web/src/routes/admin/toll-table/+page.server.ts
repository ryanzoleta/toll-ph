import { db } from '$lib/data/db';
import { expressway, point, tollMatrix, tollNetwork } from '$lib/data/schema';
import type { RequestEvent } from '@sveltejs/kit';
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

  return {
    tollMatrix: tollMatrixResults,
    points,
    tollNetworks,
  };
}

export const actions = {
  async createTollMatrix(event: RequestEvent) {
    const formData = await event.request.formData();

    const entryPointId = formData.get('entryPointId')?.toString();
    const exitPointId = formData.get('exitPointId')?.toString();
    const fee = formData.get('fee')?.toString();
    const reversible = formData.get('reversible')?.toString();

    if (entryPointId && exitPointId && fee) {
      await db.insert(tollMatrix).values({
        vehicleClass: 1,
        entryPointId: parseInt(entryPointId),
        exitPointId: parseInt(exitPointId),
        reversible: reversible === 'on',
        fee: fee,
      });
    }
  },
};
