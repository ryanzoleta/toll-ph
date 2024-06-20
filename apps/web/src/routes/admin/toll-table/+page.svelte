<script lang="ts">
  import * as Table from '$lib/components/ui/table';
  import { cn } from '$lib/utils';
  import * as Card from '$lib/components/ui/card';
  import * as Select from '$lib/components/ui/select';
  import Label from '$lib/components/ui/label/label.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import { Switch } from '$lib/components/ui/switch';
  import { enhance } from '$app/forms';
  import type { TollMatrix } from '$lib/data/schema.js';

  export let data;

  let currentExpressway = data.expressways[0];

  $: matrices = data.tollMatrix
    .filter((matrix) => matrix.entryExpressway.id === currentExpressway.id)
    .sort((a, b) => (a.exitPoint.sequence ?? 0) - (b.exitPoint.sequence ?? 0))
    .sort((a, b) => (a.entryPoint.sequence ?? 0) - (b.entryPoint.sequence ?? 0));

  let inputMatrix: TollMatrix = {
    entryPointId: 0,
    exitPointId: 0,
    fee: null,
    reversible: false,
  };
</script>

<div class="flex flex-col gap-5">
  <h2 class="text-lg font-bold">Toll Table</h2>

  <div class="flex flex-row gap-5">
    {#each data.expressways as expressway}
      <button
        class={cn(
          'underline-offset-2 hover:underline',
          expressway.id === currentExpressway.id ? 'underline' : null
        )}
        on:click={() => {
          currentExpressway = expressway;
        }}>{expressway.name}</button>
    {/each}
  </div>

  <Card.Root class="w-1/3">
    <Card.Header>
      <Card.Title>Add Toll Matrix</Card.Title>
    </Card.Header>
    <Card.Content>
      <form method="POST" action="?/createTollMatrix" class="flex flex-col gap-5" use:enhance>
        <div>
          <Label>Entry</Label>
          <Select.Root>
            <Select.Trigger>
              <Select.Value placeholder="Entry Point" />
            </Select.Trigger>
            <Select.Content class="max-h-[500px] overflow-y-scroll">
              {#each data.points.filter((p) => p.expressway.id === currentExpressway.id) as p}
                <Select.Item value={p.point.id}>{p.point.name} ({p.expressway.id})</Select.Item>
              {/each}
            </Select.Content>
            <Select.Input name="entryPointId" />
          </Select.Root>
        </div>

        <div>
          <Label>Exit</Label>
          <Select.Root>
            <Select.Trigger>
              <Select.Value placeholder="Exit Point" />
            </Select.Trigger>
            <Select.Content class="max-h-[500px] overflow-y-scroll">
              {#each data.points as p}
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
