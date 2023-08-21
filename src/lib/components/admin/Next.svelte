<script lang="ts">
  import type { Point } from '$lib/types';
  import axios from 'axios';
  import IconPlus from '../icons/IconPlus.svelte';
  import IconTrash from '../icons/IconTrash.svelte';
  import { createQuery } from '@tanstack/svelte-query';

  export let point: Point;
  export let direction: 'NORTH' | 'SOUTH';

  let destination: string;

  const query = createQuery({
    queryKey: ['next', point.id, direction],
    queryFn: async () => {
      const response = await axios.get(`/api/link/${point.id}/${direction}`);
      return response.data;
    },
    refetchOnWindowFocus: false
  });

  $query;

  async function deleteLink(id: number, nextId: number, dir: 'NORTH' | 'SOUTH') {
    await axios.delete(`/api/link/${id}/${nextId}/${dir}`);
    $query.refetch();
  }

  async function addLink() {
    await axios.post('/api/link', { originId: point.id, destination: destination, direction });
    $query.refetch();
    destination = '';
  }
</script>

<div>Next {direction}</div>
<div>
  <div class="flex place-items-center gap-2">
    <input
      type="text"
      class="rounded-md border border-gray-800 bg-gray-800 p-1"
      bind:value={destination} />
    <button class="h-5 w-5 text-gray-500" on:click={addLink}><IconPlus /></button>
  </div>
  {#if $query.isLoading}
    <p>Loading...</p>
  {:else}
    {#each $query.data as next}
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
