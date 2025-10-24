<script lang="ts">
  import { toggleMode } from 'mode-watcher';
  import Button from '$lib/components/ui/button/button.svelte';
  import { Sun, Moon, Loader2 } from 'lucide-svelte';
  import AppStore from '$lib/assets/images/appstore.svg';
  import PlayStore from '$lib/assets/images/playstore.png';
  import { onMount } from 'svelte';
  import Coffee from '$lib/components/ui/Coffee.svelte';
  import { authClient } from '$lib/auth-client';
  import type { Session, User } from '$lib/data/schema';
  import { differenceInDays } from 'date-fns';
  import { getRemainingTrialDays } from '$lib/utils';

  export let session: any | null = null;
  export let user: User | null = null;

  export let showSignIn = false;
  export let showSignUp = false;

  let os: 'apple' | 'android' | undefined = undefined;
  let loading = false;

  onMount(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();

    if (userAgent.includes('ios') || userAgent.includes('mac')) {
      os = 'apple';
    } else if (userAgent.includes('android')) {
      os = 'android';
    }
  });

  async function logout() {
    loading = true;
    await authClient.signOut();
    window.location.href = '/';
  }

  async function checkout() {
    await authClient.checkout({
      slug: 'pro',
    });
  }
</script>

<header>
  <div
    class="flex flex-row items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
    <div class="flex flex-row items-center gap-3">
      <a href="/pro" class="text-3xl font-bold text-slate-950 dark:text-slate-300"
        ><h1>
          toll.ph
          <span class="text-3xl italic text-sky-400 dark:text-sky-600">pro</span>
        </h1>
      </a>
    </div>

    <div class="flex flex-row items-center gap-3">
      <a
        href="/matrix"
        class="text-sm text-slate-500 transition-all duration-100 hover:text-slate-200 hover:underline"
        >Matrix</a>

      {#if session && user}
        <Button on:click={checkout}>
          Subscribe Now ({getRemainingTrialDays(user)} days left in trial)
        </Button>

        <Button
          on:click={logout}
          variant="outline"
          disabled={loading}
          class="flex flex-row items-center gap-2">
          {#if loading}
            <Loader2 class="h-4 w-4 animate-spin" />
          {/if}
          Logout</Button>
      {:else if showSignIn}
        <Button href="/signin" variant="outline">Sign in</Button>
      {:else if showSignUp}
        <Button href="/signup" variant="outline">Sign up</Button>
      {:else}
        <Button href="/signin" variant="outline">Sign up</Button>
      {/if}

      <Button on:click={toggleMode} variant="outline" size="icon">
        <Sun
          class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon
          class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </div>
  </div>
</header>
