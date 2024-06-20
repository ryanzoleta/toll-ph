<script lang="ts">
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as Table from '$lib/components/ui/table';
  import type { TollNetwork } from '$lib/data/schema.js';

  export let data;

  let openCreateDialog = false;
  let openEditDialog = false;

  let editData: TollNetwork = {
    id: '',
    name: '',
    rfid: 'AUTOSWEEP',
  };
</script>

<div>
  <div class="flex flex-col gap-5">
    <div class="flex flex-row justify-between">
      <h2 class="text-lg font-bold">Toll Networks</h2>

      <Button
        on:click={() => {
          openCreateDialog = true;
        }}>Create</Button>
    </div>

    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head class="w-[100px]">ID</Table.Head>
          <Table.Head>Name</Table.Head>
          <Table.Head>RFID System</Table.Head>
          <Table.Head class="w-[100px]">Update</Table.Head>
          <Table.Head class="w-[100px]">Delete</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each data.tollNetworks as tollNetwork}
          <Table.Row>
            <Table.Cell class="font-medium">{tollNetwork.id}</Table.Cell>
            <Table.Cell>{tollNetwork.name}</Table.Cell>
            <Table.Cell>{tollNetwork.rfid}</Table.Cell>
            <Table.Cell>
              <Button
                variant="outline"
                on:click={() => {
                  openEditDialog = true;
                  editData = {
                    id: tollNetwork.id,
                    name: tollNetwork.name,
                    rfid: tollNetwork.rfid,
                  };
                }}>Update</Button>
            </Table.Cell>
            <Table.Cell>
              <form method="POST" action="?/deleteTollNetwork">
                <Input type="hidden" name="tollNetworkId" value={tollNetwork.id} />
                <Button type="submit" variant="destructive">Delete</Button>
              </form>
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</div>

<Dialog.Root bind:open={openCreateDialog}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Create New Toll Network</Dialog.Title>
    </Dialog.Header>

    <form
      method="POST"
      action="?/createTollNetwork"
      class="flex flex-col gap-5"
      on:submit={() => {
        openCreateDialog = false;
      }}>
      <div>
        <Label>ID</Label>
        <Input name="tollNetworkId" />
      </div>

      <div>
        <Label>Name</Label>
        <Input name="tollNetworkName" />
      </div>

      <div>
        <Label>RFID System</Label>
        <Input name="tollNetworkRfid" />
      </div>

      <Button type="submit">Create</Button>
    </form>
  </Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={openEditDialog}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit Toll Network</Dialog.Title>
    </Dialog.Header>

    <form
      method="POST"
      action="?/updateTollNetwork"
      class="flex flex-col gap-5"
      on:submit={() => {
        openCreateDialog = false;
      }}>
      <div>
        <Label>ID</Label>
        <Input name="tollNetworkId" value={editData.id} />
      </div>

      <div>
        <Label>Name</Label>
        <Input name="tollNetworkName" value={editData.name} />
      </div>

      <div>
        <Label>RFID System</Label>
        <Input name="tollNetworkRfid" value={editData.rfid} />
      </div>

      <Button type="submit">Update</Button>
    </form>
  </Dialog.Content>
</Dialog.Root>
