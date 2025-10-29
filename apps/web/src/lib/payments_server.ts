import { POLAR_TOLL_PH_PRO_BENEFIT_ID, REDIS_URL } from '$env/static/private';
import { RequestEvent } from '@sveltejs/kit';
import Redis from 'ioredis';
import { auth } from './auth';

const redis = new Redis(REDIS_URL);

export async function server_isSubscribed(event: RequestEvent, userId: string) {
  // const cachedIsPro = await redis.get(`isPro_${userId}`);
  // if (cachedIsPro !== null) return cachedIsPro === 'true';

  const benefits = await auth.api.benefits({ headers: event.request.headers });
  const proBenefit = benefits.result.items.find(
    (benefit: any) => benefit.benefitId === POLAR_TOLL_PH_PRO_BENEFIT_ID
  );

  // if (proBenefit) {
  //   await redis.set(`isPro_${userId}`, 'true', 'EX', 60 * 60 * 24);
  //   return true;
  // } else {
  //   await redis.set(`isPro_${userId}`, 'false', 'EX', 60 * 60 * 24);
  //   return false;
  // }

  return proBenefit ? true : false;
}
