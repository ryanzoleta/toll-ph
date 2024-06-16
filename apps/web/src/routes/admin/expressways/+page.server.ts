import { db } from '$lib/data/db';
import { expressway } from '$lib/data/schema';
import type { RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const actions = {
  createExpressway: async ({ request }: RequestEvent) => {
    const formData = await request.formData();

    const id = formData.get('expresswayId')?.toString();
    const name = formData.get('expresswayName')?.toString();
    const tollNetworkId = formData.get('expresswayTollNetworkId')?.toString();

    try {
      if (id && name) {
        await db.insert(expressway).values({ id, name, tollNetworkId });
      }
    } catch (e) {
      console.log(e);
    }
  },
  deleteExpressway: async ({ request }: RequestEvent) => {
    const formData = await request.formData();

    const id = formData.get('expresswayId')?.toString();

    try {
      if (id) {
        await db.delete(expressway).where(eq(expressway.id, id));
      }
    } catch (e) {
      console.log(e);
    }
  }
};
