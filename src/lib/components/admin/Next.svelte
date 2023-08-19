<script lang="ts">
  import type { Point } from '$lib/types';
  import axios from 'axios';
  import IconPlus from '../icons/IconPlus.svelte';
  import IconTrash from '../icons/IconTrash.svelte';

  export let point: Point;
  export let direction: 'NORTH' | 'SOUTH';

  let nextList = direction === 'NORTH' ? point.nextNorths : point.nextSouths;
  let destination: string;

  async function deleteLink(id: number, nextId: number, dir: 'NORTH' | 'SOUTH') {
    await axios.delete(`/api/link/${id}/${nextId}/${dir}`);
  }

  async function addLink() {
    await axios.post('/api/link', { originId: point.id, destination: destination, direction });
  }
</script>

<div>Next {direction}</div>
<div>
  {#if nextList}
    <div class="flex place-items-center gap-2">
      <input
        type="text"
        class="rounded-md border border-gray-800 bg-gray-800 p-1"
        bind:value={destination} />
      <button class="h-5 w-5 text-gray-500" on:click={addLink}><IconPlus /></button>
    </div>
    {#each nextList as next}
      <div class="flex place-content-between">
        <p>{next.name}</p>
        <button
          class="h-5 w-5 text-gray-500"
          on:click={() => {
            deleteLink(point.id, next.id, direction);
          }}><IconTrash /></button>
      </div>
    {/each}
  {/if}
</div>
