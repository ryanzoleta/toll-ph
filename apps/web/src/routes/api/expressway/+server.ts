import { error, RequestEvent } from '@sveltejs/kit';
import { API_KEY } from '$env/static/private';
import { verifyApiKey } from '../utils';
import { db } from '$lib/data/db';
import { expressway } from '$lib/data/schema';

export async function GET(event: RequestEvent) {
  verifyApiKey(event);

  const expressways = await db.select().from(expressway);

  if (expressways) {
    return Response.json(expressways);
  }

  return error(404, 'Not Found');
}
