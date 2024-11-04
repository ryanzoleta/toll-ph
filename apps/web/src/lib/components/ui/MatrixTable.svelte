<script lang="ts">
  import * as Select from '$lib/components/ui/select';
  import * as Table from '$lib/components/ui/table';
  import type { TollMatrix, TollMatrixFull, TollNetwork } from '$lib/data/schema';
  import type { Point } from '$lib/data/schema.js';
  import { cn } from '$lib/utils';

  export let tollNetwork: TollNetwork;
  export let tollMatrix: TollMatrixFull[];
  export let vehicleClass: { value: number; label: string };

  function getUniqueEntryPoints(tollNetworkId: string) {
    return tollMatrix
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
    return tollMatrix
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

  let hoveredIndex = -1;
</script>

<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.Head>ENTRY/EXIT</Table.Head>

      {#each getUniqueEntryPoints(tollNetwork.id) as p, index}
        <Table.Head class={cn('text-center', hoveredIndex === index ? 'bg-muted/50' : '')}>
          <button
            class="h-full w-full"
            on:mouseleave={() => {
              hoveredIndex = -1;
            }}
            on:mouseenter={() => {
              hoveredIndex = index;
            }}>
            {p.name}
          </button>
        </Table.Head>
      {/each}
    </Table.Row>
  </Table.Header>
  <Table.Body class="h-fit">
    {#each getUniqueExitPoints(tollNetwork.id) as p}
      <Table.Row>
        <Table.Cell>{p.name}</Table.Cell>
        {#each getUniqueEntryPoints(tollNetwork.id) as p2, index}
          {@const m = tollMatrix.find((m) => {
            return (
              m.entryPoint.id === p2.id &&
              m.exitPoint.id === p.id &&
              m.toll_matrix.vehicleClass === vehicleClass.value
            );
          })?.toll_matrix}
          <Table.Cell class={cn('relative h-full', hoveredIndex === index ? 'bg-muted/50' : '')}>
            <button
              class="absolute top-0 block h-full w-full"
              on:mouseleave={() => {
                hoveredIndex = -1;
              }}
              on:mouseenter={() => {
                hoveredIndex = index;
              }}>
              {m?.fee ? parseFloat(m.fee).toFixed(0) : ''}{m?.fee ? (m?.reversible ? '' : '*') : ''}
            </button>
          </Table.Cell>
        {/each}
      </Table.Row>
    {/each}
  </Table.Body>
</Table.Root>
