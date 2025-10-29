<script lang="ts">
  import HeaderPro from '$lib/components/HeaderPro.svelte';
  import { authClient } from '$lib/auth-client';
  import { redirect } from '@sveltejs/kit';
  import type { User } from '$lib/data/schema.js';
  import { checkout, getRemainingTrialDays, isSubscribed } from '$lib/payments.js';
  import Button from '$lib/components/ui/button/button.svelte';
  import { TruckIcon, TablePropertiesIcon, CircleDollarSignIcon } from 'lucide-svelte';
  import { createQuery } from '@tanstack/svelte-query';
  import * as Card from '$lib/components/ui/card/index.js';

  export let data;

  const session = data.session;
  const user = (data.session.user as User) ?? null;
  const account = data.account;

  const remainingTrialDays = getRemainingTrialDays(user);

  const customerStatusQuery = createQuery({
    queryKey: ['customerStatus'],
    queryFn: async () => {
      return await isSubscribed(user);
    },
  });

  async function logout() {
    await authClient.signOut();
    window.location.href = '/';
  }
</script>

<svelte:head>
  <title>Toll PH Pro - Account</title>
</svelte:head>

<HeaderPro {session} {user} />

<main class="flex flex-1 flex-col items-center space-y-5 px-6 py-10">
  <div class="flex w-full max-w-xl flex-col gap-10">
    <Card.Root>
      <Card.Header>
        <Card.Title>Account</Card.Title>
      </Card.Header>
      <Card.Content>
        <div class="flex flex-col gap-5">
          <div class="flex flex-row justify-between">
            <p class="">Email</p>
            <p class="text-slate-500">{user.email}</p>
          </div>

          {#if account.providerId === 'google'}
            <div class="flex flex-row justify-between">
              <p class="">Signed in with</p>
              <p class="text-slate-500">{account.providerId}</p>
            </div>
          {:else}
            <div class="flex flex-row justify-between">
              <p class="">Signed in with</p>
              <p class="text-slate-500">Email and Password</p>
            </div>

            <Button variant="outline" href="/account/password">Change Password</Button>
          {/if}
        </div>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header>
        <Card.Title>Subscription</Card.Title>
      </Card.Header>
      <Card.Content>
        <div class="flex flex-col gap-5">
          <div class="flex flex-row justify-between">
            <p class="">Status</p>

            {#if data.isPro}
              <p class="text-slate-500">Subscribed to Pro</p>
            {:else if remainingTrialDays > 0}
              <p class="text-slate-500">Free Trial</p>
            {:else}
              <p class="text-slate-500">Trial Ended</p>
            {/if}
          </div>

          {#if data.isPro}
            <Button variant="outline" on:click={() => redirect(302, '/paywall')}
              >Cancel Subscription</Button>
          {:else if remainingTrialDays > 0}
            <Button variant="outline" on:click={() => redirect(302, '/paywall')}
              >Subscribe to Pro</Button>
          {:else}
            <Button variant="outline" on:click={() => redirect(302, '/paywall')}
              >Subscribe to Pro</Button>
          {/if}
        </div>
      </Card.Content>
    </Card.Root>

    <p class="text-center text-sm">
      Problems with your account? Contact support at <a
        href="mailto:support@toll.ph"
        class="text-slate-500 underline hover:opacity-80">contact@toll.ph</a>
    </p>
  </div>
</main>
