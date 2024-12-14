import { error, RequestEvent } from '@sveltejs/kit';
import { API_KEY } from '$env/static/private';
import { verifyApiKey } from '../utils';

export async function GET(event: RequestEvent) {
  verifyApiKey(event);

  return Response.json({ message: 'Hello from Expressway!' });
}
