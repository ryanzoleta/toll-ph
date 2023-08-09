<script lang="ts">
  import type { Point } from '$lib/data/schema';
  import { capitalize, stringifyEnum } from '$lib/utils';
  import { fade } from 'svelte/transition';

  export let points: Point[];

  let input = '';
  let displaySearchResults = false;
  let searchResults: Point[] = [];
  let selectedPointId = 0;

  function matches(query: string, point: Point) {
    return (
      point.name?.toUpperCase().startsWith(query.toUpperCase()) ||
      (point.expresswayId?.toUpperCase().startsWith(query.toUpperCase()) && query.length > 1)
    );
  }

  $: if (input) {
    searchResults = points.filter((p) => matches(input, p) && p.entryable) ?? [];
  } else {
    searchResults = [];
  }

  $: if (searchResults.length > 0) {
    displaySearchResults = true;
  } else if (searchResults.length === 0) {
    displaySearchResults = false;
  }
</script>

<div class="relative">
  <input
    type="text"
    class="w-full rounded-md bg-gray-100 px-3 py-3 text-slate-700 outline-none dark:bg-gray-800 dark:text-slate-300 placeholder:dark:text-slate-600"
    placeholder="Enter point of origin"
    bind:value={input}
    on:focus={() => {
      if (input.length > 0) displaySearchResults = true;
    }}
    on:blur={() => {
      displaySearchResults = false;
    }} />

  {#if displaySearchResults}
    <div
      class="absolute top-full z-10 mt-1 flex w-full flex-col rounded-md bg-gray-200"
      transition:fade={{ duration: 50 }}>
      {#each searchResults as point, index}
        <div
          class="flex place-content-between place-items-center px-2 py-2 {point.id ===
          selectedPointId
            ? 'bg-gray-300'
            : ''}
        {index === 0 ? 'rounded-t-md' : ''}
        {index === searchResults.length - 1 ? 'rounded-b-md' : ''}"
          role="textbox"
          tabindex="0"
          on:keydown={() => {
            console.log('hey');
          }}>
          <div class="flex place-items-center gap-1">
            <p class="font-bold">{capitalize(point.name)}</p>
            <p class="text-sm font-extralight italic">{stringifyEnum(point.descriptor)}</p>
          </div>
          <p class="text-sm text-gray-500">{point.expresswayId}</p>
        </div>
      {/each}
    </div>
  {/if}
</div>
