<script lang="ts">
  import type { Point } from '$lib/data/schema';
  import { capitalize, stringifyEnum } from '$lib/utils';
  import { fade } from 'svelte/transition';

  export let results: Point[];
</script>

<div
  class="absolute top-full mt-1 w-full rounded-md bg-gray-200 px-3 py-2"
  transition:fade={{ duration: 50 }}>
  {#each results as point}
    <div class="flex place-content-between place-items-center">
      <div class="flex place-items-center gap-1">
        <p class="font-bold">{capitalize(point.name)}</p>
        <p class="text-sm font-extralight italic">{stringifyEnum(point.descriptor)}</p>
      </div>
      <p class="text-sm text-gray-500">{point.expresswayId}</p>
    </div>
  {/each}
</div>
