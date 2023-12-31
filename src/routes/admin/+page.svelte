<script lang="ts">
  import Box from '$lib/components/admin/Box.svelte';
  import Form from '$lib/components/admin/Form.svelte';
  import FormButton from '$lib/components/admin/FormButton.svelte';
  import FormField from '$lib/components/admin/FormField.svelte';
  import Next from '$lib/components/admin/Next.svelte';
  import Scroller from '$lib/components/admin/Scroller.svelte';
  import { createQuery } from '@tanstack/svelte-query';
  import axios from 'axios';
  import type { Point } from '$lib/types';
  import { capitalize, stringifyEnum } from '$lib/utils.js';

  export let data;

  let point = {
    name: '',
    descriptor: '',
    expresswayId: '',
    entryable: false,
    exitable: false,
    sequence: ''
  };

  const pointsQuery = createQuery({
    queryKey: ['points'],
    queryFn: async () => {
      const response = await axios.get('/api/point');
      console.log(response.data);
      return response.data.points as Point[];
    },
    refetchOnWindowFocus: false
  });

  $pointsQuery;

  async function createPoint() {
    await axios.post('/api/point', point);

    point.name = '';
    point.descriptor = '';
    point.expresswayId = '';
    point.entryable = false;
    point.exitable = false;
    point.sequence = '';

    $pointsQuery.refetch();
  }
</script>

<div class="flex min-h-screen flex-col gap-3 bg-black p-5 text-gray-300">
  <h1 class="text-xl font-bold">Admin Panel</h1>

  <div class="flex flex-col">
    <h2 class="text-lg font-bold">Toll Networks</h2>
    <Scroller>
      <Box>
        <Form action="?/createTollNetwork">
          <FormField label="ID" name="tollNetworkId" />
          <FormField label="Name" name="tollNetworkName" />

          <FormButton variant="create" />
        </Form>
      </Box>
      {#each data.tollNetworks as tollNetwork}
        <Box>
          <Form action="?/updateTollNetwork">
            <FormField label="ID" name="tollNetworkId" value={tollNetwork.id} disabled />
            <FormField label="Name" name="tollNetworkName" value={tollNetwork.name} />

            <FormButton variant="update" />
          </Form>
          <Form action="?/deleteTollNetwork">
            <FormField label="ID" name="tollNetworkId" value={tollNetwork.id} hidden />
            <FormButton variant="delete" />
          </Form>
        </Box>
      {/each}
    </Scroller>
  </div>

  <div class="flex flex-col">
    <h2 class="text-lg font-bold">Expressways</h2>
    <Scroller>
      <Box>
        <Form action="?/createExpressway">
          <FormField label="ID" name="expresswayId" />
          <FormField label="Name" name="expresswayName" />
          <FormField variant="select" label="Toll Network" name="expresswayTollNetworkId">
            {#each data.tollNetworks as tollNetwork}
              <option value={tollNetwork.id}>{tollNetwork.id}</option>
            {/each}
          </FormField>

          <FormButton variant="create" />
        </Form>
      </Box>
      {#each data.expressways as expressway}
        <Box>
          <Form action="?/upateExpressway">
            <FormField label="ID" name="expresswayId" value={expressway.id} />
            <FormField label="Name" name="expresswayName" value={expressway.name} />
            <FormField
              variant="select"
              label="Toll Network"
              name="expresswayTollNetworkId"
              value={expressway.tollNetworkId}>
              {#each data.tollNetworks as tollNetwork}
                <option value={tollNetwork.id}>{tollNetwork.id}</option>
              {/each}
            </FormField>

            <FormButton variant="update" />
          </Form>
          <Form action="?/deleteExpressway">
            <FormField label="ID" name="expresswayId" value={expressway.id} hidden />
            <FormButton variant="delete" />
          </Form>
        </Box>
      {/each}
    </Scroller>
  </div>

  <div class="flex flex-col">
    <h2 class="text-lg font-bold">Points</h2>
    <div class="flex w-fit flex-col gap-5">
      <Box>
        <div class="grid auto-cols-fr grid-cols-2 gap-2">
          <FormField label="Name" name="pointName" bind:value={point.name} />
          <FormField label="Sequence" name="pointSequence" bind:value={point.sequence} />
          <FormField label="Descriptor" name="pointDescriptor" bind:value={point.descriptor} />
          <FormField label="Expressway" name="pointExpresswayId" bind:value={point.expresswayId} />
          <FormField
            label="Entryable"
            name="pointEntryable"
            variant="check"
            bind:checked={point.entryable} />
          <FormField
            label="Exitable"
            name="pointExitable"
            variant="check"
            bind:checked={point.exitable} />

          <button
            class="col-span-2 rounded-md bg-green-900 py-1 text-green-300"
            on:click={createPoint}>Create</button>
        </div>
      </Box>
    </div>
  </div>
  <Scroller>
    {#each data.expressways as expressway}
      <div class="flex flex-col gap-5">
        <h3 class="text-lg font-bold">{expressway.id}</h3>
        {#if $pointsQuery.isLoading}
          <p>Loading...</p>
        {:else if $pointsQuery.data}
          {#each $pointsQuery.data.filter((p) => p.expresswayId === expressway.id) as point}
            <Box>
              <div class="flex flex-col">
                <div class="flex place-content-between">
                  <div class="flex gap-1">
                    <p class="text-lg text-gray-500">#{point.sequence}</p>
                    <h3 class="text-lg font-bold">
                      {capitalize(point.name)} ({stringifyEnum(point.descriptor)})
                    </h3>
                  </div>
                  <p class="text-sm">{point.id}</p>
                </div>
                {#if point.entryable && point.exitable}
                  <p>Entryable and Exitable</p>
                {:else if point.entryable}
                  <p>Entryable</p>
                {:else if point.exitable}
                  <p>Exitable</p>
                {:else}
                  <p>Pass onlys</p>
                {/if}
              </div>

              <Next {point} direction="NORTH" allPoints={$pointsQuery.data} />
              <Next {point} direction="SOUTH" allPoints={$pointsQuery.data} />
            </Box>
          {/each}
        {/if}
      </div>
    {/each}
  </Scroller>
</div>
