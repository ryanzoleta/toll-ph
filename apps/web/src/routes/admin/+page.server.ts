import { redirect } from '@sveltejs/kit';

export async function load() {
  throw redirect(303, '/admin/toll-matrix');
}
