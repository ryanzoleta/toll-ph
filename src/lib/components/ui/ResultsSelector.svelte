<script lang="ts">
  import type { Point } from '$lib/data/schema';
  import { capitalize, stringifyEnum } from '$lib/utils';
  import { fade } from 'svelte/transition';

  export let results: Point[];

  let selectedPointId = 2;
</script>

<div
  class="absolute top-full z-10 mt-1 flex w-full flex-col rounded-md bg-gray-200"
  transition:fade={{ duration: 50 }}>
  {#each results as point, index}
    <div
      class="flex place-content-between place-items-center px-2 py-2 {point.id === selectedPointId
        ? 'bg-gray-300'
        : ''}
        {index === 0 ? 'rounded-t-md' : ''}
        {index === results.length - 1 ? 'rounded-b-md' : ''}">
      <div class="flex place-items-center gap-1">
        <p class="font-bold">{capitalize(point.name)}</p>
        <p class="text-sm font-extralight italic">{stringifyEnum(point.descriptor)}</p>
      </div>
      <p class="text-sm text-gray-500">{point.expresswayId}</p>
    </div>
  {/each}
</div>
