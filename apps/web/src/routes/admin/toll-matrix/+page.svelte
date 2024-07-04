<script lang="ts">
  import * as Table from '$lib/components/ui/table';
  import type { Point } from '$lib/data/schema.js';

  export let data;

  function getUniqueEntryPoints(tollNetworkId: string) {
    return data.tollMatrix
      .filter((matrix) => matrix.entryExpressway.tollNetworkId === tollNetworkId)
      .reduce((points, matrix) => {
        const returns = [];

        if (!points.find((p) => p.id === matrix.entryPoint.id)) {
          returns.push(matrix.entryPoint);
        }

        return [...points, ...returns];
      }, [] as Point[])
      .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
  }

  function getUniqueExitPoints(tollNetworkId: string) {
    return data.tollMatrix
      .filter((matrix) => matrix.entryExpressway.tollNetworkId === tollNetworkId)
      .reduce((points, matrix) => {
        const returns = [];

        if (!points.find((p) => p.id === matrix.exitPoint.id)) {
          returns.push(matrix.exitPoint);
        }

        return [...points, ...returns];
      }, [] as Point[])
      .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
  }
</script>

<div class="flex flex-col gap-5">
  <h2 class="text-lg font-bold">Toll Matrix</h2>

  <p class="text-sm text-slate-500">
    <strong>How to read this?</strong><br /> If you want to know the toll fee for a SOUTHBOUND
    route, the entry point are the column headers and the exit point the rows.<br />If NORTHBOUND,
    the entry point are the rows, and the exit point are the column headers.
  </p>

  <div class="flex flex-col gap-5">
    {#each data.tollNetworks as tollNetwork}
      <h3>{tollNetwork.name}</h3>

      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head>ENTRY/EXIT</Table.Head>

            {#each getUniqueEntryPoints(tollNetwork.id) as p}
              <Table.Head>{p.name}</Table.Head>
            {/each}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each getUniqueExitPoints(tollNetwork.id) as p}
            <Table.Row>
              <Table.Cell>{p.name}</Table.Cell>
              {#each getUniqueEntryPoints(tollNetwork.id) as p2}
                {@const m = data.tollMatrix.find((m) => {
                  return m.entryPoint.id === p2.id && m.exitPoint.id === p.id;
                })?.toll_matrix}
                <Table.Cell>{m?.fee ?? ''}{m?.fee ? (m?.reversible ? '' : '*') : ''}</Table.Cell>
              {/each}
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    {/each}
  </div>
</div>
