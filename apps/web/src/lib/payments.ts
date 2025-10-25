import { differenceInDays } from 'date-fns';
import type { User } from './data/schema';
import { authClient } from './auth-client';

const TRIAL_DAYS = 30;

export function getRemainingTrialDays(user: User): number {
  const trialEndDate = new Date(user.createdAt);
  trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DAYS);

  const remainingDays = differenceInDays(trialEndDate, new Date());
  return Math.max(0, remainingDays);
}

export async function checkout(slug: string) {
  await authClient.checkout({
    slug,
  });
}

export async function isSubscribed(user: User) {
  const customer = await authClient.customer.state();
  console.log('customer', customer);

  if (!customer.data) return false;
  if (customer.data.grantedBenefits.length > 0) return true;

  return false;
}
