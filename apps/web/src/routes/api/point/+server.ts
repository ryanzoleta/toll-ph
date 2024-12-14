import { error, RequestEvent } from '@sveltejs/kit';
import { API_KEY } from '$env/static/private';
import { verifyApiKey } from '../utils';
import { db } from '$lib/data/db';
import { expressway, point } from '$lib/data/schema';
import { eq } from 'drizzle-orm';

export async function GET(event: RequestEvent) {
  verifyApiKey(event);

  const points = await db
    //@ts-ignore
    .select({ ...point, tollNetworkId: expressway.tollNetworkId })
    .from(point)
    .innerJoin(expressway, eq(point.expresswayId, expressway.id));

  if (points) {
    return Response.json(points);
  }

  return error(404, 'Not Found');
}
