<script lang="ts">
  import type { Point } from '$lib/data/schema';
  import { capitalize } from '$lib/utils';
  import { fade } from 'svelte/transition';

  export let points: Point[];
  // export let kind: 'ENTRY' | 'EXIT';
  export let placeholder: string;
  // export let reachables: Point[] = [];
  export let input = '';

  $: searchResults = points
    .filter((p) => matches(input, p))
    .sort((a, b) => {
      return (a.sequence ?? 0) - (b.sequence ?? 0);
    });
  let displaySearchResults = false;
  let selectedIndex = -1;
  export let setPoint: Point | null = null;

  let inputElement: HTMLElement;

  function matches(query: string, point: Point) {
    return (
      point.name?.toLowerCase().startsWith(query.toLowerCase()) ||
      point.expresswayId?.toLowerCase().startsWith(query.toLowerCase())
    );
  }

  $: {
    // reachables;
    searchResults = points
      .filter((p) => matches(input, p))
      .sort((a, b) => {
        return (a.sequence ?? 0) - (b.sequence ?? 0);
      })
      .sort((a, b) => {
        return (a.expresswaySequence ?? 0) - (b.expresswaySequence ?? 0);
      });
  }

  $: if (!displaySearchResults) {
    selectedIndex = -1;
  }
</script>

{#if setPoint}
  <div>
    <button
      class="flex w-full place-content-between place-items-center rounded-md bg-gray-200 px-3 py-3 text-left font-bold text-slate-700 dark:bg-gray-700 dark:text-slate-100 placeholder:dark:text-slate-600"
      on:click={() => {
        input = setPoint?.name ?? '';
        setPoint = null;
        setTimeout(() => {
          inputElement.focus();
        }, 10);
      }}>
      <div class="flex place-items-center gap-1">
        <p class="font-bold">{capitalize(setPoint.name)}</p>
      </div>
      <p class="text-sm text-gray-500">{setPoint.expresswayId}</p>
    </button>
  </div>
{/if}

<div class="relative {setPoint ? 'hidden' : 'block'}">
  <input
    type="text"
    class="w-full rounded-md bg-gray-100 px-3 py-3 text-slate-700 dark:bg-gray-800 dark:text-slate-300 placeholder:dark:text-slate-600"
    {placeholder}
    bind:this={inputElement}
    bind:value={input}
    on:focus={() => {
      displaySearchResults = true;
    }}
    on:blur={() => {
      setTimeout(() => {
        displaySearchResults = false;
        if (searchResults.length === 1) {
          setPoint = searchResults[0];
        }
      }, 100);
    }}
    on:keydown={(e) => {
      if (e.key === 'ArrowUp') {
        selectedIndex = selectedIndex - 1 === -1 ? 0 : selectedIndex - 1;
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        selectedIndex =
          selectedIndex + 1 === searchResults.length ? selectedIndex : selectedIndex + 1;
        e.preventDefault();
      } else if (e.key === 'Enter') {
        if (selectedIndex > -1) {
          setPoint = searchResults[selectedIndex];
          input = capitalize(setPoint.name) ?? '';
        }
      }
    }} />

  {#if input !== ''}
    <div class="absolute right-4 top-0 flex h-full place-items-center">
      <button
        class="h-5 w-5 rounded-full bg-gray-200 text-xs text-gray-500"
        on:click|preventDefault={() => {
          input = '';
        }}>x</button>
    </div>
  {/if}

  {#if displaySearchResults && searchResults.length > 0}
    <div
      class="absolute top-full z-10 mt-1 flex max-h-[500px] w-full flex-col overflow-scroll rounded-md border border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      transition:fade={{ duration: 50 }}>
      {#each searchResults as point, index}
        <button
          class="flex place-content-between place-items-center px-2 py-2 {index === selectedIndex
            ? 'bg-gray-200 dark:bg-gray-800'
            : ''}
        {index === 0 ? 'rounded-t-md' : ''}
        {index === searchResults.length - 1 ? 'rounded-b-md' : ''}"
          on:mouseenter={() => {
            selectedIndex = index;
          }}
          on:click={() => {
            setPoint = point;
          }}>
          <div class="flex place-items-center gap-2">
            <p class="font-bold">{capitalize(point.name)}</p>
          </div>
          <p class="text-sm text-gray-500">{point.expresswayId}</p>
        </button>
      {/each}
    </div>
  {/if}
</div>
