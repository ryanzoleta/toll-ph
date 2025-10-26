import { POLAR_TOLL_PH_PRO_BENEFIT_ID } from '$env/static/private';
import { auth } from '$lib/auth';
import { db } from '$lib/data/db';
import { account as accountTable } from '$lib/data/schema';
import { RequestEvent, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load(event: RequestEvent) {
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });

  if (!session) {
    throw redirect(302, '/signin');
  }

  return {
    session,
  };
}
