<script lang="ts">
  import * as Table from '$lib/components/ui/table';
  import { cn } from '$lib/utils';

  export let data;

  let currentTollNetwork = data.tollNetworks[0];
  $: matrices = data.tollMatrix.filter(
    (matrix) => matrix.entryExpressway.tollNetworkId === currentTollNetwork.id
  );
  $: points = data.points
    .filter((point) => point.expressway.id === currentTollNetwork.id)
    .sort((a, b) => a.point.sequence ?? 0 - (b.point.sequence ?? 0));
</script>

<div class="flex flex-col gap-5">
  <h2 class="text-lg font-bold">Toll Matrix</h2>

  <p class="text-sm text-slate-500">
    <strong>How to read this?</strong><br /> If you want to know the toll fee for a SOUTHBOUND
    route, the entry point are the column headers and the exit point the rows.<br />If NORTHBOUND,
    the entry point are the rows, and the exit point are the column headers.
  </p>

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

  <Table.Root>
    <Table.Header>
      <Table.Row>
        <Table.Head>ENTRY/EXIT</Table.Head>

        {#each points as p}
          <Table.Head>{p.point.name}</Table.Head>
        {/each}
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each points as p}
        <Table.Row>
          <Table.Cell>{p.point.name}</Table.Cell>
          {#each points as p2}
            <Table.Cell
              >{matrices.find((m) => {
                return m.entryPoint.id === p2.point.id && m.exitPoint.id === p.point.id;
              })?.toll_matrix.fee ?? ''}</Table.Cell>
          {/each}
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
