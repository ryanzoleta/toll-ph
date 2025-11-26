export const prerender = true;
import { browser } from '$app/environment';
import posthog from 'posthog-js';

export const load = async () => {
  if (browser) {
    posthog.init('phc_IYP5uIv8RaCOgO1jjxjKSnio2h6tB27XwzEpPkFrJCE', {
      api_host: 'https://us.i.posthog.com',
      defaults: '2025-05-24',
    });
  }

  return;
};
