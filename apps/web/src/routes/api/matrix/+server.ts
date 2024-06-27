import { db } from '$lib/data/db';
import { tollMatrix } from '$lib/data/schema';
import type { RequestEvent } from '@sveltejs/kit';

export async function POST(event: RequestEvent) {
  const input = await event.request.json();

  const entryPointId = input['entryPointId'];
  const exitPointId = input['exitPointId'];
  const fee = input['fee'];
  const reversible = input['reversible'];

  console.log(input);

  if (entryPointId && exitPointId && fee) {
    await db.insert(tollMatrix).values({
      entryPointId: parseInt(entryPointId),
      exitPointId: parseInt(exitPointId),
      reversible: reversible === 'on',
      fee: fee,
    });

    return Response.json({ success: true });
  }

  return Response.json({ success: false });
}
