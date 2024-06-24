<script lang="ts">
  import PointSelector from '$lib/components/ui/PointSelector.svelte';
  import { formatAmountToCurrency } from '$lib/utils.js';
  import { expressways, points } from '$lib/stores.js';
  import Button from '$lib/components/ui/button/button.svelte';
  import { Sun, Moon } from 'lucide-svelte';
  import { toggleMode } from 'mode-watcher';
  import type { Point } from '$lib/data/schema.js';

  export let data;

  $points = data.points;
  $expressways = data.expressways;

  let pointOrigin: Point | null = null;
  let pointDestination: Point | null = null;
  let tollFee = 0;

  let pointOriginInput = '';
  let pointDestinationInput = '';

  function calculate() {
    if (pointOrigin && pointDestination) {
      if (pointOrigin.expresswayId === pointDestination.expresswayId) {
        let matrix = data.tollMatrix.find(
          (tm) => tm.entryPointId === pointOrigin?.id && tm.exitPointId === pointDestination?.id
        );

        if (matrix !== null && matrix !== undefined) {
          tollFee = matrix ? parseFloat(matrix.fee ?? '0') : 0;
        } else {
          matrix = data.tollMatrix.find(
            (tm) =>
              tm.entryPointId === pointDestination?.id &&
              tm.exitPointId === pointOrigin?.id &&
              tm.reversible
          );

          tollFee = matrix ? parseFloat(matrix.fee ?? '0') : 0;
        }
      } else {
        tollFee = 99;
      }
    }
  }

  function getReachables(pointId: number) {
    return data.tollMatrix.filter((tm) => tm.entryPointId === pointId).map((tm) => tm.exitPointId);
  }

  function getReachablesReversed(pointId: number) {
    return data.tollMatrix
      .filter((tm) => tm.exitPointId === pointId && tm.reversible)
      .map((tm) => tm.entryPointId);
  }

  let externallyConnectedPoints: typeof data.connections = [];

  let originReachables: number[] = [];
  let originReachablesReversed: number[] = [];

  $: {
    originReachables = getReachables(pointOrigin?.id ?? 0);
    originReachablesReversed = getReachablesReversed(pointOrigin?.id ?? 0);
  }

  $: {
    const externallyConnectedReachablePoints = data.connections.filter((c) =>
      originReachables.includes(c.point.id)
    );

    const externallyConnectedReachablePointsReversed = data.connections.filter((c) =>
      originReachablesReversed.includes(c.point.id)
    );

    externallyConnectedPoints = [
      ...(externallyConnectedReachablePoints ?? []),
      ...(externallyConnectedReachablePointsReversed ?? []),
    ];

    console.log(externallyConnectedPoints);
  }

  $: reachables = data.points.filter((p) => {
    return originReachables.includes(p.id) || originReachablesReversed.includes(p.id);
  });
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
        points={reachables}
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
        tollFee = 0;
      }}>Clear</button>
  </div>

  {#if tollFee > 0}
    <div class="flex flex-col gap-4">
      <div
        class="flex flex-col gap-2 rounded-lg bg-gray-200 p-5 dark:bg-gray-800 dark:text-gray-200">
        <div class="flex flex-col">
          <h2 class="text-gray-500">Total Toll Fees</h2>
          <div class="flex flex-col gap-5">
            <p class="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-200">
              {formatAmountToCurrency(tollFee)}
            </p>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
