<script lang="ts">
  import { authClient } from '$lib/auth-client'; //import the auth client
  import { Button } from '$lib/components/ui/button';
  import Header from '$lib/components/ui/Header.svelte';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { AlertCircle, Loader2 } from 'lucide-svelte';

  let loading = false;
  let errorMessage = '';

  async function signUp(email: string, password: string) {
    const { data, error } = await authClient.signUp.email(
      {
        email, // user email address
        password, // user password -> min 8 characters by default
        name: email, // user display name
        callbackURL: '/pro', // A URL to redirect to after the user verifies their email (optional)
      },
      {
        onRequest: (ctx) => {
          loading = true;
        },
        onSuccess: (ctx) => {
          window.location.href = '/pro';
        },
        onError: (ctx) => {
          loading = false;
          errorMessage = ctx.error.message;
        },
      }
    );
  }

  let email = '';
  let password = '';
</script>

<div class="mx-5 flex flex-col gap-10 sm:mx-auto sm:w-3/5 sm:pt-5 md:w-1/2 lg:w-3/12 xl:w-3/12">
  <Header showPro />

  <h1 class="text-2xl font-bold">Sign Up</h1>

  <form on:submit={() => signUp(email, password)} class="flex flex-col gap-5">
    <div class="flex flex-col gap-2">
      <Label for="email">Email</Label>
      <Input type="email" placeholder="Email" bind:value={email} />
    </div>

    <div class="flex flex-col gap-2">
      <Label for="email">Password</Label>
      <Input type="password" placeholder="Password" bind:value={password} />
    </div>

    {#if errorMessage}
      <div class="flex flex-row items-center gap-2 rounded-md border border-red-500 p-3">
        <AlertCircle class="h-4 w-4 text-red-500" />
        <p class="text-sm text-red-500">{errorMessage}</p>
      </div>
    {/if}

    <Button type="submit" disabled={loading}>
      {#if loading}
        <Loader2 class="h-4 w-4 animate-spin" />
      {/if}
      Signup</Button>
  </form>
</div>
