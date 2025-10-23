import { createAuthClient } from 'better-auth/svelte';
import { polarClient } from '@polar-sh/better-auth';
import { organizationClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  plugins: [polarClient()],
});
