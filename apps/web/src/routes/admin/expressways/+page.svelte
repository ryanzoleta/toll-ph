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
    refetchOnWindowFocus: false,
  });

  $pointsQuery;
</script>

<div class="flex min-h-screen flex-col gap-3 p-5">
  <h1 class="text-xl font-bold">Expressways</h1>

  <div class="flex flex-col gap-5">
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
  </div>
</div>
