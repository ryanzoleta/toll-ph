import { dev } from '$app/environment';

export const prerender = true;

export async function load() {
  if (!dev) {
    throw new Error('This route is not available in production.');
  }
}
