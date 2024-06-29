<script lang="ts">
  import * as Table from '$lib/components/ui/table';
  import { cn } from '$lib/utils';
  import * as Card from '$lib/components/ui/card';
  import * as Select from '$lib/components/ui/select';
  import Label from '$lib/components/ui/label/label.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import { Switch } from '$lib/components/ui/switch';
  import type { TollMatrix } from '$lib/data/schema.js';

  export let data;

  let currentTollNetwork = data.tollNetworks[0];

  $: matrices = data.tollMatrix
    .filter((matrix) => matrix.entryExpressway.tollNetworkId === currentTollNetwork.id)
    .sort((a, b) => (a.exitPoint.sequence ?? 0) - (b.exitPoint.sequence ?? 0))
    .sort((a, b) => (a.entryPoint.sequence ?? 0) - (b.entryPoint.sequence ?? 0));

  let inputMatrix: TollMatrix = {
    entryPointId: 0,
    exitPointId: 0,
    fee: null,
    reversible: false,
  };

  async function createTollMatrix() {
    const response = await fetch('/api/matrix', {
      method: 'POST',
      body: JSON.stringify(inputMatrix),
    });

    console.log(await response.json());

    inputMatrix = {
      entryPointId: inputMatrix.entryPointId,
      exitPointId: inputMatrix.exitPointId,
      fee: '',
      reversible: inputMatrix.reversible,
    };
  }
</script>

<div class="flex flex-col gap-5">
  <h2 class="text-lg font-bold">Toll Table</h2>

  <div class="flex flex-row gap-5">
    {#each data.tollNetworks as tollNetwork}
      <button
        class={cn(
          'underline-offset-2 hover:underline',
          tollNetwork.id === currentTollNetwork.id ? 'underline' : null
        )}
        on:click={() => {
          currentTollNetwork = tollNetwork;
        }}>{tollNetwork.name}</button>
    {/each}
  </div>

  <Card.Root class="lg:w-1/3">
    <Card.Header>
      <Card.Title>Add Toll Matrix</Card.Title>
    </Card.Header>
    <Card.Content>
      <form method="POST" class="flex flex-col gap-5" on:submit|preventDefault={createTollMatrix}>
        <div>
          <Label>Entry</Label>
          <Select.Root
            items={data.points
              .filter((p) => p.expressway.tollNetworkId === currentTollNetwork.id)
              .map((p) => {
                return {
                  value: p.point.id,
                  text: `${p.point.name} (${p.expressway.id})`,
                };
              })}
            onSelectedChange={(selected) => {
              if (selected) inputMatrix.entryPointId = selected.value;
            }}>
            <Select.Trigger>
              <Select.Value placeholder="Entry Point" />
            </Select.Trigger>
            <Select.Content class="max-h-[500px] overflow-y-scroll">
              {#each data.points.filter((p) => p.expressway.tollNetworkId === currentTollNetwork.id) as p}
                <Select.Item value={p.point.id}>{p.point.name} ({p.expressway.id})</Select.Item>
              {/each}
            </Select.Content>
            <Select.Input name="entryPointId" />
          </Select.Root>
        </div>

        <div>
          <Label>Exit</Label>
          <Select.Root
            items={data.points
              .filter((p) => p.expressway.tollNetworkId === currentTollNetwork.id)
              .map((p) => {
                return {
                  value: p.point.id,
                  text: `${p.point.name} (${p.expressway.id})`,
                };
              })}
            onSelectedChange={(selected) => {
              if (selected) inputMatrix.exitPointId = selected.value;
            }}>
            <Select.Trigger>
              <Select.Value placeholder="Exit Point" />
            </Select.Trigger>
            <Select.Content class="max-h-[500px] overflow-y-scroll">
              {#each data.points.filter((p) => p.expressway.tollNetworkId === currentTollNetwork.id) as p}
                <Select.Item value={p.point.id}>{p.point.name} ({p.expressway.id})</Select.Item>
              {/each}
            </Select.Content>
            <Select.Input name="exitPointId" />
          </Select.Root>
        </div>

        <div>
          <Label>Fee</Label>
          <Input name="fee" type="number" bind:value={inputMatrix.fee} />
        </div>

        <div class="flex flex-col gap-2">
          <Label>Reversible?</Label>
          <Switch name="reversible" bind:checked={inputMatrix.reversible} />
        </div>

        <div class="flex flex-row justify-end gap-3">
          <Button
            variant="outline"
            on:click={() => {
              inputMatrix = {
                entryPointId: 0,
                exitPointId: 0,
                fee: null,
                reversible: false,
              };
            }}>Clear</Button>
          <Button type="submit">Add</Button>
        </div>
      </form>
    </Card.Content>
  </Card.Root>

  <Table.Root class="w-1/2">
    <Table.Header>
      <Table.Row>
        <Table.Head>Entry</Table.Head>
        <Table.Head>Exit</Table.Head>
        <Table.Head>Fee</Table.Head>
        <Table.Head>Reversible</Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each matrices as m}
        <Table.Row>
          <Table.Cell>{m.entryPoint.name}</Table.Cell>
          <Table.Cell>{m.exitPoint.name}</Table.Cell>
          <Table.Cell>{m.toll_matrix.fee}</Table.Cell>
          <Table.Cell>{m.toll_matrix.reversible}</Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
