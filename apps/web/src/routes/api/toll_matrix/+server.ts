import { error, RequestEvent } from '@sveltejs/kit';
import { API_KEY } from '$env/static/private';
import { verifyApiKey } from '../utils';
import { db } from '$lib/data/db';
import { expressway, point, tollMatrix, tollNetwork } from '$lib/data/schema';

export async function GET(event: RequestEvent) {
  verifyApiKey(event);

  const tollMatrixAll = await db.select().from(tollMatrix);

  if (tollMatrixAll) {
    return Response.json(tollMatrixAll);
  }

  return error(404, 'Not Found');
}
