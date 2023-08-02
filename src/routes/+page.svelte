<script lang="ts">
  import IconSun from '$lib/components/icons/IconSun.svelte';
  import IconButton from '$lib/components/ui/IconButton.svelte';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import IconMoon from '$lib/components/icons/IconMoon.svelte';

  let darkMode = false;

  $: if (browser) {
    localStorage.setItem('dark_mode', JSON.stringify(darkMode));

    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  onMount(() => {
    const darkModeLocal = localStorage.getItem('dark_mode');
    darkMode = darkModeLocal ? JSON.parse(darkModeLocal) : false;
  });
</script>

<div class="mx-5 flex flex-col gap-5 sm:mx-auto sm:w-3/5 sm:pt-5 md:w-1/2 lg:w-2/5 xl:w-4/12">
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

  <div class="flex flex-col gap-2">
    <h3 class="font-bold text-slate-700 dark:text-slate-300">Origin</h3>
    <input
      type="text"
      class="w-full rounded-md bg-gray-100 px-3 py-3 text-slate-700 outline-none dark:bg-gray-800 dark:text-slate-300 placeholder:dark:text-slate-600"
      placeholder="Enter point of origin" />
  </div>

  <div class="flex flex-col gap-2">
    <h3 class="font-bold text-slate-700 dark:text-slate-300">Destination</h3>
    <input
      type="text"
      class="w-full rounded-md bg-gray-100 px-3 py-3 text-slate-700 outline-none dark:bg-gray-800 dark:text-slate-300 placeholder:dark:text-slate-600"
      placeholder="Enter point of destination" />
  </div>
</div>
