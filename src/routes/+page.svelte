<script lang="ts">
  import IconSun from '$lib/components/icons/IconSun.svelte';
  import IconButton from '$lib/components/ui/IconButton.svelte';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import IconMoon from '$lib/components/icons/IconMoon.svelte';

  let darkMode = true;

  onMount(() => {
    const darkModeLocal = localStorage.getItem('dark_mode');
    darkMode = darkModeLocal ? JSON.parse(darkModeLocal) : true;
  });

  $: if (browser) {
    localStorage.setItem('dark_mode', JSON.stringify(darkMode));

    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
</script>

<div class="mx-5 sm:mx-auto sm:w-3/5 sm:pt-5 md:w-1/2 lg:w-2/5 xl:w-4/12">
  <div class="flex place-content-between place-items-center">
    <h1 class="text-3xl font-bold text-slate-950 dark:text-slate-300">toll.ph</h1>

    <IconButton
      on:click={() => {
        darkMode = !darkMode;
      }}>
      {#if darkMode}
        <IconSun />
      {:else}
        <IconMoon />
      {/if}
    </IconButton>
  </div>
</div>
