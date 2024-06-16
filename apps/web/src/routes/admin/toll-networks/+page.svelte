<script lang="ts">
  import Box from '$lib/components/admin/Box.svelte';
  import Form from '$lib/components/admin/Form.svelte';
  import FormButton from '$lib/components/admin/FormButton.svelte';
  import FormField from '$lib/components/admin/FormField.svelte';
  import { createQuery } from '@tanstack/svelte-query';
  import axios from 'axios';
  import type { Point } from '$lib/types';

  export let data;

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
</script>

<div class="flex min-h-screen flex-col gap-3 bg-black p-5 text-gray-300">
  <div class="flex flex-col">
    <h2 class="text-lg font-bold">Toll Networks</h2>
    <div class="flex flex-col gap-5">
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
    </div>
  </div>
</div>
