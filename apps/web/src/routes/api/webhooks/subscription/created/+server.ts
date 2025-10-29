import { POLAR_WEBHOOK_SECRET, REDIS_URL } from '$env/static/private';
import { db } from '$lib/data/db';
import { user as userTable } from '$lib/data/schema';
import { eq } from 'drizzle-orm';
import { RequestEvent } from '@sveltejs/kit';
import Redis from 'ioredis';

const redis = new Redis(REDIS_URL);

export async function POST(event: RequestEvent) {
  const body = await event.request.json();

  console.log(body);

  const email = body.data.customer.email;

  const result = await db.select().from(userTable).where(eq(userTable.email, email));

  if (result.length === 0) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  const user = result[0];

  await redis.set(`isPro_${user.id}`, 'true', 'EX', 60 * 60 * 24);

  return Response.json({ success: true });
}
