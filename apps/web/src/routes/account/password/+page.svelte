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

  let oldPassword = '';
  let newPassword = '';
  let confirmNewPassword = '';
  let loading = false;

  let errorMessage = '';

  async function handleChangePassword() {
    loading = true;
    errorMessage = '';
    if (newPassword !== confirmNewPassword) {
      errorMessage = 'New password and confirm new password do not match';
      loading = false;
      return;
    }

    const { data, error } = await authClient.changePassword({
      currentPassword: oldPassword,
      newPassword,
      revokeOtherSessions: true,
    });

    if (error) {
      errorMessage = error.message ?? 'An unknown error occurred';
      loading = false;
      return;
    }

    window.location.href = '/account/password/success';

    loading = false;
  }
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
        <Card.Title>Change Password</Card.Title>
      </Card.Header>
      <Card.Content>
        <div class="flex flex-col gap-5">
          <Label for="oldPassword">Old Password</Label>
          <Input type="password" bind:value={oldPassword} />
          <Label for="newPassword">New Password</Label>
          <Input type="password" bind:value={newPassword} />
          <Label for="confirmNewPassword">Confirm New Password</Label>
          <Input type="password" bind:value={confirmNewPassword} />

          {#if errorMessage}
            <div class="flex flex-row items-center gap-2 rounded-md border border-red-500 p-3">
              <AlertCircle class="h-4 w-4 text-red-500" />
              <p class="text-sm text-red-500">{errorMessage}</p>
            </div>
          {/if}

          <Button type="submit" disabled={loading} on:click={handleChangePassword}
            >Change Password</Button>
        </div>
      </Card.Content>
    </Card.Root>
  </div>
</main>
