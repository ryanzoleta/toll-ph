<script lang="ts">
  import IconSun from '$lib/components/icons/IconSun.svelte';
  import IconButton from '$lib/components/ui/IconButton.svelte';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import IconMoon from '$lib/components/icons/IconMoon.svelte';
  import type { Point } from '$lib/data/schema';
  import { fade } from 'svelte/transition';
  import { capitalize, stringifyEnum } from '$lib/utils.js';
  import ResultsSelector from '$lib/components/ui/ResultsSelector.svelte';

  export let data;

  let inputOrigin: string;
  let inputDestination: string;
  let originSearchResults: Point[] = [];
  let destinationSearchResults: Point[] = [];

  let darkMode: boolean;

  onMount(() => {
    const darkModeLocal = localStorage.getItem('dark_mode');
    darkMode = darkModeLocal ? JSON.parse(darkModeLocal) : false;
  });

  $: if (browser && darkMode !== undefined) {
    localStorage.setItem('dark_mode', JSON.stringify(darkMode));

    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  $: if (inputOrigin) {
    originSearchResults =
      data.points.filter((p) => {
        return p.name?.toUpperCase().startsWith(inputOrigin.toUpperCase()) && p.entryable;
      }) ?? [];
  } else {
    originSearchResults = [];
  }

  $: if (inputDestination) {
    destinationSearchResults =
      data.points.filter((p) => {
        return p.name?.toUpperCase().startsWith(inputDestination.toUpperCase()) && p.exitable;
      }) ?? [];
  } else {
    destinationSearchResults = [];
  }
</script>

<div class="mx-5 flex flex-col gap-10 sm:mx-auto sm:w-3/5 sm:pt-5 md:w-1/2 lg:w-2/5 xl:w-4/12">
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

  <div class="flex flex-col gap-5">
    <div class="flex flex-col gap-2">
      <h3 class="font-bold text-slate-700 dark:text-slate-300">Origin</h3>
      <div class="relative">
        <input
          type="text"
          class="w-full rounded-md bg-gray-100 px-3 py-3 text-slate-700 outline-none dark:bg-gray-800 dark:text-slate-300 placeholder:dark:text-slate-600"
          placeholder="Enter point of origin"
          bind:value={inputOrigin} />
        {#if originSearchResults.length > 0}
          <ResultsSelector results={originSearchResults} />
        {/if}
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <h3 class="font-bold text-slate-700 dark:text-slate-300">Destination</h3>
      <div class="relative">
        <input
          type="text"
          class="w-full rounded-md bg-gray-100 px-3 py-3 text-slate-700 outline-none dark:bg-gray-800 dark:text-slate-300 placeholder:dark:text-slate-600"
          placeholder="Enter point of destination"
          bind:value={inputDestination} />

        {#if destinationSearchResults.length > 0}
          <ResultsSelector results={destinationSearchResults} />
        {/if}
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <button
      class="rounded-md bg-green-300 py-3 font-bold text-green-800 transition duration-100 hover:bg-green-400 dark:bg-green-800 dark:text-green-200 dark:hover:bg-green-700"
      >Calculate</button>
  </div>
</div>
