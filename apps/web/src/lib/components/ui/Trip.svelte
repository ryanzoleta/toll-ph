<script lang="ts">
  import type { TripResult } from '$lib/types';
  import { formatAmountToCurrency } from '$lib/utils';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let trip: TripResult;
  let expanded = false;

  function dispatchDelete() {
    dispatch('delete', trip);
  }
</script>

<div
  class="flex flex-col gap-5 rounded-lg bg-slate-100 p-5 transition-all duration-100 hover:opacity-70 dark:bg-slate-900"
  role="button"
  tabindex="0"
  on:keydown={(e) => {
    if (e.key === 'Enter') {
      expanded = !expanded;
    }
  }}
  on:click={() => {
    expanded = !expanded;
  }}>
  <div class="flex w-full flex-row items-center justify-between gap-10">
    <div class="flex flex-1 flex-row items-center justify-between gap-2">
      <div class="flex flex-1 flex-col items-center">
        <p class="text-slate-400 dark:text-slate-600">
          {trip.tollSegments[0].entryPoint.expresswayId}
        </p>
        <p class="text-center font-bold">{trip.tollSegments[0].entryPoint.name}</p>
      </div>

      <p class="flex-1 text-center text-slate-400 dark:text-slate-600">→</p>

      <div class="flex flex-1 flex-col items-center">
        <p class="text-slate-400 dark:text-slate-600">
          {trip.tollSegments[trip.tollSegments.length - 1].exitPoint.expresswayId}
        </p>
        <p class="text-center font-bold">
          {trip.tollSegments[trip.tollSegments.length - 1].exitPoint.name}
        </p>
      </div>
    </div>

    <p class="text-right text-2xl font-bold">{formatAmountToCurrency(trip.totalFee)}</p>
  </div>

  {#if expanded}
    <div class="w-full border-b border-b-slate-200 dark:border-b-slate-800" />

    <div class="flex w-full flex-col text-sm">
      {#each trip.tollSegments as segment}
        <div class="flex flex-row justify-between">
          <p class="flex-1 text-left text-slate-400 dark:text-slate-600">
            {segment.entryPoint.expresswayId}
          </p>
          {#if segment.entryPoint.id === segment.exitPoint.id}
            <p class="flex-1 text-center">{segment.entryPoint.name}</p>
          {:else}
            <div class="flex flex-row gap-2">
              <p class="">{segment.entryPoint.name}</p>
              <p class="text-slate-400 dark:text-slate-600">→</p>
              <p class="">{segment.exitPoint.name}</p>
            </div>
          {/if}

          <div class="flex flex-1 flex-row items-center gap-2">
            <p class="flex-1 text-right text-slate-400 dark:text-slate-600">
              {formatAmountToCurrency(segment.fee)}
            </p>
            {#if segment.entryPoint.rfid === 'AUTOSWEEP'}
              <div class="font-mono text-xs text-green-600 dark:text-green-500">A</div>
            {:else}
              <div class="font-mono text-xs text-blue-600 dark:text-blue-500">E</div>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <button
      class="w-full text-right text-sm text-slate-400 hover:underline dark:text-slate-600"
      on:click={dispatchDelete}>Delete</button>
  {/if}
</div>
