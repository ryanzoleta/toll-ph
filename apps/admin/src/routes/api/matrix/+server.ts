import { db } from '$lib/data/db.js';
import { tollMatrix } from '$lib/data/schema.js';
import { and, eq } from 'drizzle-orm';

export async function POST(event) {
  const { request } = event;
  const body = await request.json();

  const { entryPointId, exitPointId, vehicleClass, fee } = body;

  console.log(entryPointId, exitPointId, vehicleClass, fee);

  const rec = await db
    .select()
    .from(tollMatrix)
    .where(
      and(
        eq(tollMatrix.entryPointId, entryPointId),
        eq(tollMatrix.exitPointId, exitPointId),
        eq(tollMatrix.vehicleClass, vehicleClass)
      )
    );

  if (rec) {
    if (rec[0].fee !== fee) {
      await db
        .update(tollMatrix)
        .set({ fee })
        .where(
          and(
            eq(tollMatrix.entryPointId, entryPointId),
            eq(tollMatrix.exitPointId, exitPointId),
            eq(tollMatrix.vehicleClass, vehicleClass)
          )
        );
      return Response.json({ message: 'Success' });
    }

    return Response.json({ message: 'No changes' });
  }

  return Response.json({ message: 'Fail' });
}
