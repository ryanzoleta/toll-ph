<script lang="ts">
  import { authClient } from '$lib/auth-client'; //import the auth client
  import HeaderPro from '$lib/components/HeaderPro.svelte';
  import { Button } from '$lib/components/ui/button';
  import Header from '$lib/components/ui/Header.svelte';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-svelte';
  import * as Card from '$lib/components/ui/card/index.js';

  let loading = false;
  let errorMessage = '';

  async function signIn(email: string, password: string) {
    const { data, error } = await authClient.signIn.email(
      {
        /**
         * The user email
         */
        email,
        /**
         * The user password
         */
        password,
        /**
         * A URL to redirect to after the user verifies their email (optional)
         */
        callbackURL: '/pro',
        /**
         * remember the user session after the browser is closed.
         * @default true
         */
        rememberMe: false,
      },
      {
        onRequest: (ctx) => {
          loading = true;
        },
        onSuccess: (ctx) => {
          loading = false;
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

<HeaderPro />

<main class="mx-auto max-w-lg flex-1 space-y-5 px-6 py-10">
  <a
    href="/"
    class="flex flex-row items-center gap-1 text-sm text-slate-500 transition-all duration-100 hover:text-slate-200 hover:underline"
    ><ArrowLeft class="h-4 w-4" /> Go Back</a>

  <Card.Root>
    <Card.Header>
      <Card.Title>Sign In</Card.Title>
      <Card.Description>Sign in to your Pro account</Card.Description>
    </Card.Header>
    <Card.Content>
      <form on:submit={() => signIn(email, password)} class="flex flex-col gap-5">
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

        <div class="flex flex-col gap-2">
          <Button type="submit" disabled={loading}>
            {#if loading}
              <Loader2 class="h-4 w-4 animate-spin" />
            {/if}

            Sign In</Button>

          <Button variant="outline">Sign In with Google</Button>
        </div>
      </form>
    </Card.Content>
    <!-- <Card.Footer>
      <p>Card Footer</p>
    </Card.Footer> -->
  </Card.Root>
</main>
