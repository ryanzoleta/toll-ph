<script lang="ts">
  import IconSun from '$lib/components/icons/IconSun.svelte';
  import IconButton from '$lib/components/ui/IconButton.svelte';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import IconMoon from '$lib/components/icons/IconMoon.svelte';
  import PointSelector from '$lib/components/ui/PointSelector.svelte';
  import type { Point } from '$lib/data/schema';
  import type { Action } from '$lib/types';
  import { capitalize, generateActions, stringifyEnum } from '$lib/utils.js';

  export let data;

  let darkMode: boolean;
  let pointOrigin: Point;
  let pointDestination: Point;
  let actions: Action[] = [];

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
      <PointSelector
        points={data.points}
        kind="ENTRY"
        placeholder="Enter point of origin"
        bind:setPoint={pointOrigin} />
    </div>

    <div class="flex flex-col gap-2">
      <h3 class="font-bold text-slate-700 dark:text-slate-300">Destination</h3>
      <PointSelector
        points={data.points}
        kind="EXIT"
        placeholder="Enter point of destination"
        bind:setPoint={pointDestination} />
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <button
      class="rounded-md bg-green-300 py-3 font-bold text-green-800 transition duration-100 hover:bg-green-400 dark:bg-green-800 dark:text-green-200 dark:hover:bg-green-700"
      on:click={() => {
        actions = generateActions(pointOrigin, pointDestination);
      }}>Calculate</button>
  </div>

  {#if actions.length > 0}
    {#each actions as action}
      <div class="p-1">
        <p>
          {capitalize(action.action)}
          {capitalize(action.point.name)}
          {stringifyEnum(action.point.descriptor)}
        </p>
      </div>
    {/each}
  {/if}
</div>
