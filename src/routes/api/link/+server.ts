import { db } from '$lib/data/db';
import { link, point } from '$lib/data/schema';
import { json, type RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function POST(event: RequestEvent) {
  const body = await event.request.json();
  const { originId, destination, direction } = body;

  const results = await db.select().from(point).where(eq(point.name, destination));

  if (results && results.length > 0) {
    console.log({ originPointId: originId, nextPointId: results[0].id, direction });
    await db
      .insert(link)
      .values({ originPointId: originId, nextPointId: results[0].id, direction });
  } else {
    console.log(body);
  }

  return json('ok');
}
