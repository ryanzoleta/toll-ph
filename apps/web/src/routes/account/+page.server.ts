import { POLAR_TOLL_PH_PRO_BENEFIT_ID } from '$env/static/private';
import { auth } from '$lib/auth';
import { db } from '$lib/data/db';
import { account as accountTable } from '$lib/data/schema';
import { server_isSubscribed } from '$lib/payments_server';
import { RequestEvent, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load(event: RequestEvent) {
  console.time('Loading account page took');
  console.time('Authenticating took');
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });
  console.timeEnd('Authenticating took');

  if (!session) {
    throw redirect(302, '/signin');
  }

  console.time('Fetching account took');
  const accountResult = await db
    .select()
    .from(accountTable)
    .where(eq(accountTable.userId, session.user.id));

  if (accountResult.length === 0) {
    throw redirect(302, '/signin');
  }

  const account = accountResult[0];
  console.timeEnd('Fetching account took');

  console.time('Fetching benefits took');
  const isPro = await server_isSubscribed(event, session.user.id);
  console.timeEnd('Fetching benefits took');

  console.timeEnd('Loading account page took');

  return {
    session,
    account,
    isPro,
  };
}
