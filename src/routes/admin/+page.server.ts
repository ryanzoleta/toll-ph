import { db } from '$lib/data/db';
import { expressway, tollNetwork } from '$lib/data/schema';
import type { RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load() {
  const tollNetworks = await db.select().from(tollNetwork);
  const expressways = await db.select().from(expressway);

  return {
    tollNetworks,
    expressways
  };
}

export const actions = {
  createTollNetwork: async ({ request }: RequestEvent) => {
    const formData = await request.formData();

    const id = formData.get('tollNetworkId')?.toString();
    const name = formData.get('tollNetworkName')?.toString();

    try {
      if (id && name) {
        await db.insert(tollNetwork).values({ id, name });
      }
    } catch (e) {
      console.log(e);
    }
  },
  deleteTollNetwork: async ({ request }: RequestEvent) => {
    const formData = await request.formData();

    const id = formData.get('tollNetworkId')?.toString();

    try {
      if (id) {
        await db.delete(tollNetwork).where(eq(tollNetwork.id, id));
      }
    } catch (e) {
      console.log(e);
    }
  },
  createExpressway: async ({ request }: RequestEvent) => {
    const formData = await request.formData();

    const id = formData.get('expresswayId')?.toString();
    const name = formData.get('expresswayName')?.toString();

    try {
      if (id && name) {
        await db.insert(tollNetwork).values({ id, name });
      }
    } catch (e) {
      console.log(e);
    }
  }
};
