<script lang="ts">
  import { authClient } from '$lib/auth-client'; //import the auth client
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import GoogleIcon from '$lib/assets/images/google_neutral.svg';
  import HeaderPro from '$lib/components/HeaderPro.svelte';
  import SignInGoogle from '$lib/components/SignInGoogle.svelte';

  let loading = false;
  let errorMessage = '';
  let loadingGoogle = false;

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

<HeaderPro session={null} showSignIn />

<main class="mx-auto max-w-lg flex-1 space-y-5 px-6 py-10">
  <a
    href="/"
    class="flex flex-row items-center gap-1 text-sm text-slate-500 transition-all duration-100 hover:text-slate-200 hover:underline"
    ><ArrowLeft class="h-4 w-4" /> Go Back</a>
  <Card.Root>
    <Card.Header>
      <Card.Title>Sign Up</Card.Title>
      <Card.Description>Sign up for a Pro account</Card.Description>
    </Card.Header>
    <Card.Content>
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

        <div class="flex flex-col gap-2">
          <Button type="submit" disabled={loading}>
            {#if loading}
              <Loader2 class="h-4 w-4 animate-spin" />
            {/if}

            Sign up for Pro (30 day free trial)</Button>

          <div class="my-2 flex items-center">
            <hr class="flex-grow border-slate-200 dark:border-slate-700" />
            <span class="mx-3 text-center text-sm text-slate-500">or</span>
            <hr class="flex-grow border-slate-200 dark:border-slate-700" />
          </div>

          <SignInGoogle>Sign up with Google</SignInGoogle>
        </div>
      </form>
    </Card.Content>
    <Card.Footer class="w-full rounded-b-md border-t bg-slate-200 pt-6 dark:bg-slate-900">
      <p class="w-full text-center text-sm text-slate-400 dark:text-slate-500">
        Already have an account? <a
          href="/signin"
          class="text-slate-700 hover:underline dark:text-slate-300">Sign in</a>
      </p>
    </Card.Footer>
  </Card.Root>
</main>
