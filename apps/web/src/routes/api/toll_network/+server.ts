import { error, RequestEvent } from '@sveltejs/kit';
import { API_KEY } from '$env/static/private';
import { verifyApiKey } from '../utils';
import { db } from '$lib/data/db';
import { expressway, point, tollNetwork } from '$lib/data/schema';

export async function GET(event: RequestEvent) {
  verifyApiKey(event);

  const tollNetworks = await db.select().from(tollNetwork);

  if (tollNetworks) {
    return Response.json(tollNetworks);
  }

  return error(404, 'Not Found');
}
