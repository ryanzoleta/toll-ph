import { error, RequestEvent } from '@sveltejs/kit';
import { API_KEY } from '$env/static/private';

export function verifyApiKey(event: RequestEvent) {
  const key = event.url.searchParams.get('key');

  if (!key || key !== API_KEY) {
    throw error(401, 'Unauthorized');
  }
}
