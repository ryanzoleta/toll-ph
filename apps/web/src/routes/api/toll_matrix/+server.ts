import { error, RequestEvent } from '@sveltejs/kit';
import { API_KEY } from '$env/static/private';
import { verifyApiKey } from '../utils';
import { db } from '$lib/data/db';
import { expressway, point, tollMatrix, tollNetwork } from '$lib/data/schema';
import { and, eq } from 'drizzle-orm';

export async function GET(event: RequestEvent) {
  verifyApiKey(event);

  const tollMatrixAll = await db.select().from(tollMatrix);

  if (tollMatrixAll) {
    return Response.json(tollMatrixAll);
  }

  return error(404, 'Not Found');
}

export async function POST(event: RequestEvent) {
  verifyApiKey(event);
  console.log('verified key');

  const body = (await event.request.json()) as TMRequest;

  try {
    await db
      .update(tollMatrix)
      .set({
        fee: body.fee,
      })
      .where(
        and(
          eq(tollMatrix.entryPointId, body.entryPointId),
          eq(tollMatrix.exitPointId, body.exitPointId),
          eq(tollMatrix.vehicleClass, body.vehicleClass)
        )
      );

    return Response.json({ success: true });
  } catch {
    return Response.json({ success: false });
  }
}

type TMRequest = {
  entryPointId: number;
  exitPointId: number;
  vehicleClass: number;
  fee: string;
};
