<script lang="ts">
  import { authClient } from '$lib/auth-client'; //import the auth client
  import HeaderPro from '$lib/components/HeaderPro.svelte';
  import { Button } from '$lib/components/ui/button';
  import Header from '$lib/components/ui/Header.svelte';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import GoogleIcon from '$lib/assets/images/google_neutral.svg';

  let loading = false;
  let loadingGoogle = false;
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

  async function signInWithGoogle() {
    loadingGoogle = true;
    const { data, error } = await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/pro',
    });

    if (error && error.message) {
      loadingGoogle = false;
      errorMessage = error.message;
    }
  }

  let email = '';
  let password = '';
</script>

<svelte:head>
  <title>Sign In | Toll.ph Pro</title>
</svelte:head>

<HeaderPro session={null} />

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

            Sign in</Button>

          <div class="my-2 flex items-center">
            <hr class="flex-grow border-slate-200 dark:border-slate-700" />
            <span class="mx-3 text-center text-sm text-slate-500">or</span>
            <hr class="flex-grow border-slate-200 dark:border-slate-700" />
          </div>

          <Button
            variant="outline"
            class="flex flex-row items-center gap-2"
            on:click={signInWithGoogle}
            disabled={loadingGoogle}>
            {#if loadingGoogle}
              <Loader2 class="h-4 w-4 animate-spin" />
            {:else}
              <img src={GoogleIcon} alt="Google Icon" class="h-6 w-6" />
            {/if}

            Sign in with Google
          </Button>
        </div>
      </form>
    </Card.Content>
    <Card.Footer class="w-full border-t bg-slate-900 pt-6 ">
      <p class="w-full text-center text-sm text-slate-500">
        Don't have an account? <a href="/signup" class="hover:underline dark:text-slate-300"
          >Sign up</a>
      </p>
    </Card.Footer>
  </Card.Root>
</main>
