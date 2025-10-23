import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './data/db';
import { polar, checkout, portal, usage, webhooks } from '@polar-sh/better-auth';
import { Polar } from '@polar-sh/sdk';

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  // Use 'sandbox' if you're using the Polar Sandbox environment
  // Remember that access tokens, products, etc. are completely separated between environments.
  // Access tokens obtained in Production are for instance not usable in the Sandbox environment.
  server: 'production',
});

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  database: drizzleAdapter(db, {
    provider: 'pg', // or "mysql", "sqlite"
  }),
  user: {
    deleteUser: {
      enabled: true,
      afterDelete: async (user, request) => {
        await polarClient.customers.deleteExternal({
          externalId: user.id,
        });
      },
    },
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: '4051276a-a36b-4334-8a9c-03e2ab75f271', // ID of Product from Polar Dashboard
              slug: 'pro-monthly', // Custom slug for easy reference in Checkout URL, e.g. /checkout/pro
            },
            {
              productId: '01b0cb52-7fe4-42e8-874d-88f606f18823', // ID of Product from Polar Dashboard
              slug: 'pro-annual', // Custom slug for easy reference in Checkout URL, e.g. /checkout/pro
            },
          ],
          successUrl: '/success?checkout_id={CHECKOUT_ID}',
          authenticatedUsersOnly: true,
          returnUrl: `${process.env.BETTER_AUTH_URL}/pro`,
        }),
        portal(),
      ],
    }),
  ],
});
