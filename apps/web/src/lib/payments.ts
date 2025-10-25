import { differenceInDays } from 'date-fns';
import type { User } from './data/schema';

const TRIAL_DAYS = 30;

export function getRemainingTrialDays(user: User): number {
  const trialEndDate = new Date(user.createdAt);
  trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DAYS);

  const remainingDays = differenceInDays(trialEndDate, new Date());
  return Math.max(0, remainingDays);
}
