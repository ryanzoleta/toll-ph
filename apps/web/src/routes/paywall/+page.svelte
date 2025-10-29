<script lang="ts">
  import HeaderPro from '$lib/components/HeaderPro.svelte';
  import { authClient } from '$lib/auth-client';
  import { redirect } from '@sveltejs/kit';
  import type { User } from '$lib/data/schema.js';
  import { checkout, getRemainingTrialDays, isSubscribed } from '$lib/payments.js';
  import Button from '$lib/components/ui/button/button.svelte';
  import { TruckIcon, TablePropertiesIcon, CircleDollarSignIcon } from 'lucide-svelte';
  import { createQuery } from '@tanstack/svelte-query';

  export let data;

  const session = data.session;
  const user = (data.session.user as User) ?? null;

  const remainingTrialDays = getRemainingTrialDays(user);

  const customerStatusQuery = createQuery({
    queryKey: ['customerStatus'],
    queryFn: async () => {
      return await isSubscribed(user);
    },
  });
</script>

<svelte:head>
  <title>Toll PH Pro - Subscribe</title>
</svelte:head>

<HeaderPro {session} {user} />

<main class="flex flex-1 flex-col items-center space-y-5 px-6 py-10">
  <div class="flex w-full max-w-xl flex-col gap-10">
    {#if remainingTrialDays > 0}
      <h1 class="flex flex-row items-center justify-center gap-2 text-center text-4xl font-light">
        Subscribe to Toll PH Pro
      </h1>
    {:else}
      <h1 class="text-center text-4xl font-light">
        Your free trial has ended, subscribe to continue using pro features
      </h1>
    {/if}

    <div class="flex flex-col gap-2">
      <p class="text-center text-sm text-slate-500">
        Get unlimited access to all pro features for a month or a year
      </p>
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex w-full flex-col items-center gap-5 md:flex-row">
        <div class="flex w-full flex-1 flex-col gap-5 rounded-lg border p-5">
          <div class="flex flex-col gap-2">
            <p class="text-slate-500">Monthly</p>
            <p class="text-3xl font-bold">
              $2 <span class="text-lg font-light italic text-slate-400">per month</span>
            </p>
          </div>
          <Button
            variant="default"
            size="sm"
            class="w-full"
            on:click={() => checkout('pro-monthly')}>Subscribe</Button>
        </div>

        <p class="text-slate-500">or</p>

        <div class="flex w-full flex-1 flex-col gap-5 rounded-lg border p-5">
          <div class="flex flex-col gap-2">
            <div class="flex flex-row items-center justify-between">
              <p class="text-slate-500">Yearly</p>
              <p class="italic text-green-500">save 50%</p>
            </div>
            <p class="text-3xl font-bold">
              $12 <span class="text-lg font-light italic text-slate-400">per year</span>
            </p>
          </div>
          <Button variant="default" size="sm" class="w-full" on:click={() => checkout('pro-annual')}
            >Subscribe</Button>
        </div>
      </div>
    </div>

    <p class="text-center text-sm italic text-slate-400 dark:text-slate-600">
      Payment in USD. PHP coming soon...
    </p>
    <!-- <div class="flex flex-col items-center gap-5">
      <h2 class="text-2xl font-bold">Pro Features</h2>

      <div class="flex w-full flex-col items-center gap-10">
        <div class="flex flex-col items-center gap-1">
          <div class="flex flex-row items-center gap-2">
            <TruckIcon class="h-6 w-6 text-slate-500" />
            <p class="font-bold">Class 2 & 3</p>
          </div>
          <p class=" text-sm text-slate-500">
            Calculate toll fees for class 2 and 3 vehicles (buses, trucks)
          </p>
        </div>

        <div class="flex flex-col items-center gap-1">
          <div class="flex flex-row items-center gap-2">
            <TablePropertiesIcon class="h-6 w-6 text-slate-500" />
            <p class="font-bold">Export to Excel</p>
          </div>
          <p class=" text-sm text-slate-500">Create Excel reports for your monthly toll expenses</p>
        </div>

        <div class="flex flex-col items-center gap-1">
          <div class="flex flex-row items-center gap-2">
            <CircleDollarSignIcon class="h-6 w-6 text-slate-500" />
            <p class="font-bold">Monthly Estimates</p>
          </div>
          <p class=" text-sm text-slate-500">
            Estimate monthly toll expenses for your logistics fleet
          </p>
        </div>
      </div>
    </div> -->
  </div>
</main>
