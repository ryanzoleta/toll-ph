<script lang="ts">
  import { enhance } from '$app/forms';
  import Box from '$lib/components/admin/Box.svelte';
  import Form from '$lib/components/admin/Form.svelte';
  import FormCreateButton from '$lib/components/admin/FormCreateButton.svelte';
  import FormField from '$lib/components/admin/FormField.svelte';
  import Scroller from '$lib/components/admin/Scroller.svelte';

  export let data;
</script>

<div class="flex flex-col gap-3 p-5">
  <h1 class="text-xl font-bold">Admin Panel</h1>

  <div class="flex flex-col">
    <h2 class="text-lg font-bold">Toll Networks</h2>
    <Scroller>
      <Box>
        <Form action="?/createTollNetwork">
          <FormField label="ID" name="tollNetworkId" />
          <FormField label="Name" name="tollNetworkName" />

          <FormCreateButton />
        </Form>
      </Box>
      {#each data.tollNetworks as tollNetwork}
        <Box>
          <p>ID: {tollNetwork.id}</p>
          <p>Name: {tollNetwork.name}</p>
          <form method="POST" action="?/deleteTollNetwork" use:enhance>
            <input type="hidden" name="tollNetworkId" value={tollNetwork.id} />
            <input
              type="submit"
              value="Delete"
              class="w-full rounded-md bg-red-400 py-1 text-red-100" />
          </form>
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

          <FormCreateButton />
        </Form>
      </Box>
      {#each data.expressways as expressway}
        <Box>
          <p>ID: {expressway.id}</p>
          <p>Name: {expressway.name}</p>
          <p>Toll Network: {expressway.tollNetworkId}</p>
          <form method="POST" action="?/deleteTollNetwork" use:enhance>
            <input type="hidden" name="tollNetworkId" value={expressway.id} />
            <input
              type="submit"
              value="Delete"
              class="w-full rounded-md bg-red-400 py-1 text-red-100" />
          </form>
        </Box>
      {/each}
    </Scroller>
  </div>
</div>
