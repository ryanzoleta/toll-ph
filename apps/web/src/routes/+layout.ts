export const prerender = true;
import { browser } from '$app/environment';
import posthog from 'posthog-js';
import { dev } from '$app/environment';
import { injectAnalytics } from '@vercel/analytics/sveltekit';

injectAnalytics({ mode: dev ? 'development' : 'production' });

export const load = async () => {
  if (browser) {
    posthog.init('phc_IYP5uIv8RaCOgO1jjxjKSnio2h6tB27XwzEpPkFrJCE', {
      api_host: 'https://us.i.posthog.com',
      defaults: '2025-05-24',
    });
  }

  return;
};
