<script lang="ts">
  import * as Table from '$lib/components/ui/table';
  import type { Point } from '$lib/data/schema.js';
  import { cn } from '$lib/utils';

  export let data;

  let currentExpressway = data.expressways[0];

  $: matrices = data.tollMatrix.filter(
    (matrix) =>
      matrix.entryExpressway.id === currentExpressway.id ||
      matrix.exitExpressway.id === currentExpressway.id
  );

  $: points = matrices
    .reduce((points, matrix) => {
      const returns = [];

      if (
        matrix.entryPoint.expresswayId !== currentExpressway.id &&
        matrix.exitPoint.expresswayId !== currentExpressway.id
      ) {
        return points;
      }

      if (!points.find((p) => p.id === matrix.entryPoint.id)) {
        returns.push(matrix.entryPoint);
      }

      if (!points.find((p) => p.id === matrix.exitPoint.id)) {
        returns.push(matrix.exitPoint);
      }

      return [...points, ...returns];
    }, [] as Point[])
    // .filter((point) => point.expresswayId === currentExpressway.id)
    .filter((p) => p.descriptor === 'TOLL_GATE')
    .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
</script>

<div class="flex flex-col gap-5">
  <h2 class="text-lg font-bold">Toll Matrix</h2>

  <p class="text-sm text-slate-500">
    <strong>How to read this?</strong><br /> If you want to know the toll fee for a SOUTHBOUND
    route, the entry point are the column headers and the exit point the rows.<br />If NORTHBOUND,
    the entry point are the rows, and the exit point are the column headers.
  </p>

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

  <Table.Root>
    <Table.Header>
      <Table.Row>
        <Table.Head>ENTRY/EXIT</Table.Head>

        {#each points as p}
          <Table.Head>{p.name}</Table.Head>
        {/each}
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each points as p}
        <Table.Row>
          <Table.Cell>{p.name}</Table.Cell>
          {#each points as p2}
            <Table.Cell
              >{matrices.find((m) => {
                return m.entryPoint.id === p2.id && m.exitPoint.id === p.id;
              })?.toll_matrix.fee ?? ''}</Table.Cell>
          {/each}
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
