<script lang="ts">
  import HeaderPro from '$lib/components/HeaderPro.svelte';
  import { authClient } from '$lib/auth-client';
  import { redirect } from '@sveltejs/kit';
  import type { User } from '$lib/data/schema.js';
  import { checkout, getRemainingTrialDays, isSubscribed } from '$lib/payments.js';
  import Button from '$lib/components/ui/button/button.svelte';
  import {
    TruckIcon,
    TablePropertiesIcon,
    CircleDollarSignIcon,
    AlertCircle,
    ArrowLeft,
  } from 'lucide-svelte';
  import { createQuery } from '@tanstack/svelte-query';
  import * as Card from '$lib/components/ui/card/index.js';
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';

  export let data;

  const session = data.session;
  const user = (data.session.user as User) ?? null;
</script>

<svelte:head>
  <title>Toll PH Pro - Account</title>
</svelte:head>

<HeaderPro {session} {user} />

<main class="flex flex-1 flex-col items-center space-y-5 px-6 py-10">
  <div class="flex w-full max-w-xl flex-col gap-10">
    <a
      href="/account"
      class="flex flex-row items-center gap-1 text-sm text-slate-500 transition-all duration-100 hover:text-slate-200 hover:underline"
      ><ArrowLeft class="h-4 w-4" /> Go Back</a>
    <Card.Root>
      <Card.Header>
        <Card.Title>Password Changed Successfully</Card.Title>
      </Card.Header>
      <Card.Content>
        <div class="flex flex-col gap-5">
          <p class="text-sm text-slate-500">
            Your password has been successfully changed. You will be signed out of other devices.
          </p>

          <Button variant="outline" href="/account">OK, got it</Button>
        </div>
      </Card.Content>
    </Card.Root>
  </div>
</main>
