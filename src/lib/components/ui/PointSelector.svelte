<script lang="ts">
  import type { Point } from '$lib/data/schema';
  import { capitalize, stringifyEnum } from '$lib/utils';
  import { fade } from 'svelte/transition';

  export let points: Point[];
  export let kind: 'ENTRY' | 'EXIT';

  let input = '';
  let displaySearchResults = false;
  let searchResults: Point[] = [];
  let selectedIndex = -1;

  function matches(query: string, point: Point) {
    return (
      (point.name?.toUpperCase().startsWith(query.toUpperCase()) ||
        (point.expresswayId?.toUpperCase().startsWith(query.toUpperCase()) && query.length > 1)) &&
      ((kind === 'ENTRY' && point.entryable) || (kind === 'EXIT' && point.exitable))
    );
  }

  $: if (input) {
    searchResults = points.filter((p) => matches(input, p)) ?? [];
  } else {
    searchResults = [];
  }

  $: if (searchResults.length > 0) {
    displaySearchResults = true;
  } else if (searchResults.length === 0) {
    displaySearchResults = false;
  }

  $: if (!displaySearchResults) {
    selectedIndex = -1;
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
    }}
    on:keydown={(e) => {
      if (e.key === 'ArrowUp') {
        selectedIndex = selectedIndex - 1 === -1 ? 0 : selectedIndex - 1;
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        selectedIndex =
          selectedIndex + 1 === searchResults.length ? selectedIndex : selectedIndex + 1;
        e.preventDefault();
      }
    }} />

  {#if displaySearchResults}
    <div
      class="absolute top-full z-10 mt-1 flex w-full flex-col rounded-md border border-gray-300 bg-gray-100"
      transition:fade={{ duration: 50 }}>
      {#each searchResults as point, index}
        <button
          class="flex place-content-between place-items-center px-2 py-2 {index === selectedIndex
            ? 'bg-gray-200'
            : ''}
        {index === 0 ? 'rounded-t-md' : ''}
        {index === searchResults.length - 1 ? 'rounded-b-md' : ''}"
          role="textbox"
          tabindex="0"
          on:mouseenter={() => {
            selectedIndex = index;
          }}>
          <div class="flex place-items-center gap-1">
            <p class="font-bold">{capitalize(point.name)}</p>
            <p class="text-sm font-extralight italic">{stringifyEnum(point.descriptor)}</p>
          </div>
          <p class="text-sm text-gray-500">{point.expresswayId}</p>
        </button>
      {/each}
    </div>
  {/if}
</div>
