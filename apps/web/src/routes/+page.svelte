<script lang="ts">
  import PointSelector from '$lib/components/ui/PointSelector.svelte';
  import type { Action, Point } from '$lib/types';
  import { capitalize, formatAmountToCurrency, stringifyEnum } from '$lib/utils.js';
  import { expressways, points, tollFeeMatrix } from '$lib/stores.js';
  import Button from '$lib/components/ui/button/button.svelte';
  import { Sun, Moon } from 'lucide-svelte';
  import { toggleMode } from 'mode-watcher';

  export let data;

  $points = data.points;
  $expressways = data.expressways;
  $tollFeeMatrix = data.tollFeeMatrix;

  let pointOrigin: Point | null = null;
  let pointDestination: Point | null = null;
  let actions: Action[] = [];
  let tollFee = 0;

  let pointOriginInput = '';
  let pointDestinationInput = '';

  async function calculate() {
    if (pointOrigin && pointDestination) {
      tollFee = 0;

      actions.forEach((a) => {
        if (a.amount) tollFee += a.amount;
      });
    }
  }

  function getExpressway(point: Point) {
    return $expressways.find((e) => e.id === point.expresswayId);
  }
</script>

<div class="mx-5 flex flex-col gap-10 sm:mx-auto sm:w-3/5 sm:pt-5 md:w-1/2 lg:w-2/5 xl:w-4/12">
  <div class="flex place-content-between place-items-center">
    <h1 class="text-3xl font-bold text-slate-950 dark:text-slate-300">toll.ph</h1>

    <Button on:click={toggleMode} variant="outline" size="icon">
      <Sun
        class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon
        class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span class="sr-only">Toggle theme</span>
    </Button>
  </div>

  <div class="flex flex-col gap-5">
    <div class="flex flex-col gap-2">
      <h3 class="font-bold text-slate-700 dark:text-slate-300">Origin</h3>
      <PointSelector
        bind:input={pointOriginInput}
        points={data.points}
        placeholder="Enter point of origin"
        bind:setPoint={pointOrigin} />
    </div>

    <div class="flex flex-col gap-2">
      <h3 class="font-bold text-slate-700 dark:text-slate-300">Destination</h3>
      <PointSelector
        bind:input={pointDestinationInput}
        points={data.points}
        placeholder="Enter point of destination"
        bind:setPoint={pointDestination} />
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <button
      class="rounded-md bg-green-300 py-3 font-bold text-green-800 transition duration-100 hover:bg-green-400 dark:bg-green-800 dark:text-green-200 dark:hover:bg-green-700"
      on:click={calculate}>Calculate</button>
    <button
      class="rounded-md bg-gray-200 py-3 font-bold text-gray-600 transition duration-100 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
      on:click={() => {
        pointOrigin = null;
        pointDestination = null;
        pointOriginInput = '';
        pointDestinationInput = '';
        actions = [];
      }}>Clear</button>
  </div>

  {#if actions.length > 0}
    <div class="flex flex-col gap-4">
      <div
        class="flex flex-col gap-2 rounded-lg bg-gray-200 p-5 dark:bg-gray-800 dark:text-gray-200">
        <div class="flex place-content-between">
          <h2 class="text-xl font-bold text-gray-500">Total Toll Fees</h2>
          <div class="flex flex-col gap-5">
            <p class="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-200">
              {formatAmountToCurrency(tollFee)}
            </p>
          </div>
        </div>
        <div>
          <h2 class=" text-xl font-bold text-gray-500">Pay at these toll gates</h2>
          <div>
            {#each actions as action}
              {#if action.amount}
                <div class="flex place-content-between">
                  <p>
                    <span class="font-bold">{capitalize(action.point.name)}</span>
                    <span class="text-gray-500"
                      >({stringifyEnum(getExpressway(action.point)?.rfid)})</span>
                  </p>
                  <p class="font-bold tracking-tight text-gray-600 dark:text-gray-200">
                    {formatAmountToCurrency(action.amount)}
                  </p>
                </div>
              {/if}
            {/each}
          </div>
        </div>
      </div>

      <div class="flex flex-col rounded-lg bg-gray-200 p-5 dark:bg-gray-800 dark:text-gray-200">
        <h2 class="mb-2 text-xl font-bold text-gray-500">Route</h2>
        {#each actions as action, index}
          <div class="flex gap-2 {index === 0 ? 'place-items-end' : 'place-items-start'}">
            <div class="relative flex h-5 w-5 flex-col place-items-center">
              {#if index === 0}
                <div class="absolute top-1 h-full w-2 bg-blue-400" />
                <div
                  class="absolute left-0 top-0 h-full w-full rounded-full border-4 border-blue-400 bg-white" />
              {:else if index === actions.length - 1}
                <div class="absolute bottom-1 h-full w-2 bg-blue-400" />
                <div
                  class="absolute bottom-0 left-0 h-full w-full rounded-full border-4 border-blue-400 bg-white" />
              {:else}
                <div class="absolute top-1 h-full w-2 bg-blue-400" />
                <div
                  class="absolute left-0 top-0 h-full w-full rounded-full border-4 border-blue-400 bg-white" />
              {/if}
            </div>
            {#if action.action === 'PAY' && action.amount}
              <p class="text-gray-700 dark:text-gray-400">
                {capitalize(action.action.toLowerCase())}
                <span class="font-bold text-gray-800 dark:text-gray-100"
                  >{formatAmountToCurrency(action.amount)}</span>
                toll fee at
                <span class="font-bold text-gray-800 dark:text-gray-100"
                  >{capitalize(action.point.name)}</span>
                <span class="text-gray-500"
                  >({stringifyEnum(getExpressway(action.point)?.rfid)})</span>
              </p>
            {:else if action.action === 'ENTER' || action.action === 'EXIT'}
              <p class="text-gray-700 dark:text-gray-400">
                {capitalize(action.action.toLowerCase())}
                {action.point.expresswayId}
                at
                <span class="font-bold text-gray-800 dark:text-gray-100"
                  >{capitalize(action.point.name)}</span>
              </p>
            {/if}
          </div>

          {#if index !== actions.length - 1}
            <div class="flex h-5 w-5 flex-col place-items-center">
              <div class="h-full w-2 bg-blue-400" />
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {/if}
</div>
