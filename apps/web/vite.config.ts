import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    allowedHosts: ['toll.ph', '31fd95fc1620.ngrok-free.app'],
  },
});
