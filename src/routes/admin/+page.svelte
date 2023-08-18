<script lang="ts">
  import { enhance } from '$app/forms';
  import Box from '$lib/components/admin/Box.svelte';
  import Form from '$lib/components/admin/Form.svelte';
  import FormButton from '$lib/components/admin/FormButton.svelte';
  import FormField from '$lib/components/admin/FormField.svelte';
  import Scroller from '$lib/components/admin/Scroller.svelte';

  export let data;
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
    <div class="flex w-fit flex-col gap-1">
      <Box>
        <Form action="?/createPoint">
          <FormField label="ID" name="pointId" />
          <FormField label="Name" name="pointName" />

          <FormButton variant="create" />
        </Form>
      </Box>
      {#each data.points as point}
        <Box>
          <Form action="?/updatePoint">
            <FormField label="ID" name="pointId" value={point.id.toString()} />
            <FormField label="Name" name="pointName" value={point.name} />
            <FormField label="Descriptor" name="pointDescriptor" value={point.descriptor} />

            <FormButton variant="update" />
          </Form>
          <Form action="?/deletePoint">
            <FormField label="ID" name="pointId" value={point.id.toString()} hidden />
            <FormButton variant="delete" />
          </Form>
        </Box>
      {/each}
    </div>
  </div>
</div>
