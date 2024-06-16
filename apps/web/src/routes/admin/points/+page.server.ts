import { db } from '$lib/data/db';
import { point } from '$lib/data/schema';
import type { RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const actions = {
  createPoint: async ({ request }: RequestEvent) => {
    const formData = await request.formData();

    const name = formData.get('pointName')?.toString();
    const sequence = parseInt(formData.get('pointSequence')?.toString() as string);
    const descriptor = formData.get('pointDescriptor')?.toString() as
      | 'ENTRANCE_RAMP'
      | 'EXIT_RAMP'
      | 'TOLL_GATE';
    const expresswayId = formData.get('pointExpresswayId')?.toString();
    const entryable = formData.get('pointEntryable')?.toString() ? true : false;
    const exitable = formData.get('pointExitable')?.toString() ? true : false;

    try {
      if (name && descriptor && expresswayId) {
        await db
          .insert(point)
          .values({ name, sequence, descriptor, expresswayId, entryable, exitable });
      }
    } catch (e) {
      console.log(e);
    }
  },
  updatePoint: async ({ request }: RequestEvent) => {
    const formData = await request.formData();

    const id = parseInt(formData.get('pointId')?.toString() as string);
    const name = formData.get('pointName')?.toString();
    const sequence = parseInt(formData.get('pointSequence')?.toString() as string);
    const descriptor = formData.get('pointDescriptor')?.toString() as
      | 'ENTRANCE_RAMP'
      | 'EXIT_RAMP'
      | 'TOLL_GATE';
    const expresswayId = formData.get('pointExpresswayId')?.toString();
    const entryable = formData.get('pointEntryable')?.toString() ? true : false;
    const exitable = formData.get('pointExitable')?.toString() ? true : false;

    try {
      if (name && descriptor && expresswayId) {
        await db
          .update(point)
          .set({ name, sequence, descriptor, expresswayId, entryable, exitable })
          .where(eq(point.id, id));
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
