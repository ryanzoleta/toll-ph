<script lang="ts">
  import { toggleMode } from 'mode-watcher';
  import Button from '$lib/components/ui/button/button.svelte';
  import { Sun, Moon } from 'lucide-svelte';
  import AppStore from '$lib/assets/images/appstore.svg';
  import PlayStore from '$lib/assets/images/playstore.png';
  import { onMount } from 'svelte';

  export let showCalculatorButton = false;
  let os: 'apple' | 'android' | undefined = undefined;

  onMount(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();

    if (userAgent.includes('ios') || userAgent.includes('mac')) {
      os = 'apple';
    } else if (userAgent.includes('android')) {
      os = 'android';
    }
  });
</script>

<div class="flex place-content-between place-items-center py-2 md:py-0">
  <div class="flex flex-row items-center gap-5">
    <a href="/" class="text-3xl font-bold text-slate-950 dark:text-slate-300"><h1>toll.ph</h1></a>
  </div>

  <div class="flex flex-row items-center gap-5">
    <a
      href="/matrix"
      class="text-sm text-slate-500 transition-all duration-100 hover:text-slate-200 hover:underline"
      >Matrix</a>

    {#if os}
      {#if os === 'apple'}
        <a
          href="https://apps.apple.com/app/apple-store/id6572299762?pt=126844345&ct=WebApp&mt=8"
          target="_blank">
          <img src={AppStore} alt="App Store Link" class="h-10" />
        </a>
      {:else}
        <a
          href="https://play.google.com/store/apps/details?id=com.ryanzoleta.tollph&pcampaignid=web_share"
          target="_blank">
          <img src={PlayStore} alt="Play Store Link" class="h-10" />
        </a>
      {/if}
    {/if}

    {#if showCalculatorButton}
      <Button href="/">Use the Calculator!</Button>
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
