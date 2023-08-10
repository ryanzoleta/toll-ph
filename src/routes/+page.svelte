<script lang="ts">
  import IconSun from '$lib/components/icons/IconSun.svelte';
  import IconButton from '$lib/components/ui/IconButton.svelte';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import IconMoon from '$lib/components/icons/IconMoon.svelte';
  import PointSelector from '$lib/components/ui/PointSelector.svelte';
  import type { Action, Point } from '$lib/types';
  import { capitalize, formatAmountToCurrency, stringifyEnum } from '$lib/utils.js';
  import first from '$lib/assets/images/first.png';
  import last from '$lib/assets/images/last.png';
  import line from '$lib/assets/images/line.png';
  import middle from '$lib/assets/images/middle.png';
  import { generateActions } from '$lib/brain.js';
  import { expressways, points, tollFeeMatrix } from '$lib/stores.js';

  export let data;

  $points = data.points;
  $expressways = data.expressways;
  $tollFeeMatrix = data.tollFeeMatrix;

  let darkMode: boolean;
  let pointOrigin: Point = data.points[0];
  let pointDestination: Point = data.points[4];
  let actions: Action[] = [];
  let tollFee = 0;

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

  async function calculate() {
    actions = generateActions(pointOrigin, pointDestination);

    tollFee = 0;

    actions.forEach((a) => {
      if (a.amount) tollFee += a.amount;
    });
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
      on:click={calculate}>Calculate</button>
  </div>

  {#if actions.length > 0}
    <div class="flex flex-col rounded-lg bg-gray-200 p-5 dark:bg-gray-800 dark:text-gray-200">
      <div class="flex flex-col gap-5">
        <div>
          <p class="text-gray-400">Total Toll Fees</p>
          <p class="text-4xl font-extrabold tracking-tight text-gray-900">
            {formatAmountToCurrency(tollFee)}
          </p>
        </div>
        <div>
          <p class="text-gray-400">Toll gates</p>
          {#each actions as action}
            {#if action.amount}
              <div class="flex place-content-between">
                <p>{capitalize(action.point.name)}</p>
                <p class="font-extrabold tracking-tight text-gray-700">
                  {formatAmountToCurrency(action.amount)}
                </p>
              </div>
            {/if}
          {/each}
        </div>
      </div>
    </div>

    <div class="flex flex-col rounded-lg bg-gray-200 p-5 dark:bg-gray-800 dark:text-gray-200">
      <h2 class="mb-2 text-xl font-bold">Route</h2>
      {#each actions as action, index}
        <div class="flex gap-2 {index === 0 ? 'place-items-end' : 'place-items-start'}">
          <div class="h-5 w-5">
            {#if index === 0}
              <img src={first} alt="first action" />
            {:else if index === actions.length - 1}
              <img src={last} alt="last action" />
            {:else}
              <img src={middle} alt="middle action" />
            {/if}
          </div>
          {#if action.action === 'PAY' && action.amount}
            <p class="text-gray-400">
              {capitalize(action.action.toLowerCase())}
              <span class="font-bold text-gray-100">{formatAmountToCurrency(action.amount)}</span>
              toll fee at
              <span class="font-bold text-gray-100">{capitalize(action.point.name)}</span>
              {stringifyEnum(action.point.descriptor)}
            </p>
          {:else if action.action === 'ENTER'}
            <p class="text-gray-400">
              {capitalize(action.action.toLowerCase())}
              {action.point.expresswayId}
              at <span class="font-bold text-gray-100">{capitalize(action.point.name)}</span>
              {stringifyEnum(action.point.descriptor)}
            </p>
          {/if}
        </div>

        {#if index !== actions.length - 1}
          <div class="flex place-items-end">
            <div class="flex h-5 w-5 flex-col place-items-center">
              <img src={line} alt="first action" />
            </div>
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>
