<script lang="ts">
  import type { Point } from '$lib/types';
  import axios from 'axios';
  import IconPlus from '../icons/IconPlus.svelte';
  import IconTrash from '../icons/IconTrash.svelte';
  import { createQuery } from '@tanstack/svelte-query';
  import { stringifyEnum } from '$lib/utils';

  export let point: Point;
  export let direction: 'NORTH' | 'SOUTH';
  export let allPoints: Point[];

  let sortedPoints = structuredClone(allPoints);

  sortedPoints.sort((a, b) => {
    if (a.name && b.name) return a.name?.localeCompare(b.name);
    return 0;
  });

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
    // await axios.post('/api/link', { originId: point.id, destination: destination, direction });
    await axios.post(`/api/link/${point.id}/${destination}/${direction}`);
    $query.refetch();
    destination = '';
  }
</script>

<div class="flex place-content-between gap-2">
  <div>Next {direction}</div>
  <div>
    <div class="flex place-items-center gap-2">
      <!-- <input
      type="text"
      class="rounded-md border border-gray-800 bg-gray-800 p-1"
      bind:value={destination} /> -->
      <select
        class="w-11/12 overflow-ellipsis rounded-md border border-gray-800 bg-gray-800 p-1"
        bind:value={destination}>
        <option value="" selected>Choose</option>
        {#each sortedPoints.filter((p) => {
          return p.name !== 'null';
        }) as point}
          <option value={point.id}
            >{point.name} ({stringifyEnum(point.descriptor)}) {point.expresswayId}</option>
        {/each}
      </select>
      <button class="h-5 w-1/12 text-gray-500" on:click={addLink}><IconPlus /></button>
    </div>
    {#if $query.isLoading}
      <p>Loading...</p>
    {:else}
      {#each $query.data as next}
        <div class="flex place-content-between">
          <p>{next.name} ({stringifyEnum(next.descriptor)}) {next.expresswayId}</p>
          <button
            class="h-5 w-5 text-gray-500"
            on:click={() => {
              deleteLink(point.id, next.id, direction);
            }}><IconTrash /></button>
        </div>
      {/each}
    {/if}
  </div>
</div>
