<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Loader2 } from 'lucide-svelte';
  import GoogleIcon from '$lib/assets/images/google_neutral.svg';
  import { authClient } from '$lib/auth-client';

  let loading = false;

  async function signInWithGoogle() {
    loading = true;
    const { data, error } = await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/pro',
    });
  }
</script>

<Button
  variant="outline"
  class="flex flex-row items-center gap-2"
  on:click={signInWithGoogle}
  disabled={loading}>
  {#if loading}
    <Loader2 class="h-4 w-4 animate-spin" />
  {:else}
    <img src={GoogleIcon} alt="Google Icon" class="h-6 w-6" />
  {/if}

  <slot />
</Button>
