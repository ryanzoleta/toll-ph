import { db } from '$lib/data/db';
import { expressway, link, point, tollNetwork } from '$lib/data/schema';
import type { RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Point as OriginalPoint } from '$lib/data/schema';
import type { Point } from '$lib/types';

export async function load() {
  const tollNetworks = await db.select().from(tollNetwork);
  const expressways = await db.select().from(expressway);

  const points: OriginalPoint[] = await db.select().from(point);

  const pointsExpanded = [];

  const alLinks = await db.select().from(link);

  for (const p of points) {
    const newPoint = p as Point;

    const northQueryResults = alLinks.filter(
      (l) => l.originPointId === p.id && l.direction === 'NORTH'
    );

    newPoint.nextNorthIds = northQueryResults.map((x) => {
      return x.nextPointId as number;
    });

    const southQueryResults = alLinks.filter(
      (l) => l.originPointId === p.id && l.direction === 'SOUTH'
    );

    newPoint.nextSouthIds = southQueryResults.map((x) => {
      return x.nextPointId as number;
    });

    pointsExpanded.push(newPoint);
  }

  return {
    tollNetworks,
    expressways,
    points: pointsExpanded
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
  },
  createPoint: async ({ request }: RequestEvent) => {
    const formData = await request.formData();

    const name = formData.get('pointName')?.toString();
    const descriptor = formData.get('pointDescriptor')?.toString() as
      | 'ENTRANCE_RAMP'
      | 'EXIT_RAMP'
      | 'TOLL_GATE';
    const expresswayId = formData.get('pointExpresswayId')?.toString();
    const entryable = formData.get('pointEntryable')?.toString() ? true : false;
    const exitable = formData.get('pointExitable')?.toString() ? true : false;

    try {
      if (name && descriptor && expresswayId) {
        await db.insert(point).values({ name, descriptor, expresswayId, entryable, exitable });
      }
    } catch (e) {
      console.log(e);
    }
  },
  deletePoint: async ({ request }: RequestEvent) => {
    const formData = await request.formData();

    const id = parseInt(formData.get('pointId')?.toString() as string);

    try {
      if (id) {
        await db.delete(point).where(eq(point.id, id));
      }
    } catch (e) {
      console.log(e);
    }
  }
};
