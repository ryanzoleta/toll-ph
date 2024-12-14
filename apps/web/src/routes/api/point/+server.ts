import { error, RequestEvent } from '@sveltejs/kit';
import { API_KEY } from '$env/static/private';
import { verifyApiKey } from '../utils';
import { db } from '$lib/data/db';
import { expressway, point } from '$lib/data/schema';

export async function GET(event: RequestEvent) {
  verifyApiKey(event);

  const points = await db.select().from(point);

  if (points) {
    return Response.json(points);
  }

  return error(404, 'Not Found');
}
