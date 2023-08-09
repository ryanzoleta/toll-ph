<script lang="ts">
  import IconSun from '$lib/components/icons/IconSun.svelte';
  import IconButton from '$lib/components/ui/IconButton.svelte';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import IconMoon from '$lib/components/icons/IconMoon.svelte';
  import type { Point } from '$lib/data/schema';
  import ResultsSelector from '$lib/components/ui/ResultsSelector.svelte';

  export let data;

  let inputOrigin = '';
  let inputDestination = '';
  let originSearchResults: Point[] = [];
  let destinationSearchResults: Point[] = [];
  let displayOriginSearchResults = false;
  let displayDestinationSearchResults = false;

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

  function matches(query: string, point: Point) {
    return (
      point.name?.toUpperCase().startsWith(query.toUpperCase()) ||
      (point.expresswayId?.toUpperCase().startsWith(query.toUpperCase()) && query.length > 1)
    );
  }

  $: if (inputOrigin) {
    originSearchResults = data.points.filter((p) => matches(inputOrigin, p) && p.entryable) ?? [];
  } else {
    originSearchResults = [];
  }

  $: if (originSearchResults.length > 0) {
    displayOriginSearchResults = true;
  } else if (originSearchResults.length === 0) {
    displayOriginSearchResults = false;
  }

  $: if (inputDestination) {
    destinationSearchResults =
      data.points.filter((p) => matches(inputDestination, p) && p.exitable) ?? [];
  } else {
    destinationSearchResults = [];
  }

  $: if (destinationSearchResults.length > 0) {
    displayDestinationSearchResults = true;
  } else if (originSearchResults.length === 0) {
    displayDestinationSearchResults = false;
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
          bind:value={inputOrigin}
          on:focus={() => {
            if (inputOrigin.length > 0) displayOriginSearchResults = true;
          }}
          on:blur={() => {
            displayOriginSearchResults = false;
          }} />

        {#if displayOriginSearchResults}
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
          bind:value={inputDestination}
          on:focus={() => {
            if (inputDestination.length > 0) displayDestinationSearchResults = true;
          }}
          on:blur={() => {
            displayDestinationSearchResults = false;
          }} />

        {#if displayDestinationSearchResults}
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
