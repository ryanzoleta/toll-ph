import { auth } from '$lib/auth';
import { redirect, RequestEvent } from '@sveltejs/kit';

export async function load(event: RequestEvent) {
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });

  if (session) {
    throw redirect(302, '/pro');
  }
}
