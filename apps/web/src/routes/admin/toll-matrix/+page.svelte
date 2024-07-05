<script lang="ts">
  import * as Table from '$lib/components/ui/table';
  import type { Point } from '$lib/data/schema.js';
  import * as Select from '$lib/components/ui/select';

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

  let vehicleClass = { value: 1, label: 'Class 1' };
  let vehicleClassList = [
    { value: 1, label: 'Class 1' },
    { value: 2, label: 'Class 2' },
    { value: 3, label: 'Class 3' },
  ];
</script>

<div class="flex flex-col gap-5">
  <h2 class="text-lg font-bold">Toll Matrix</h2>

  <div>
    <p>Vehicle Class</p>

    <Select.Root bind:selected={vehicleClass} items={vehicleClassList}>
      <Select.Trigger>
        <Select.Value placeholder="Vehicle Class" asChild let:label>
          {#if label}
            <div class="flex flex-row items-center gap-2">
              {label.substring(0, 8)}
            </div>
          {:else}
            <p>Vehicle Class</p>
          {/if}
        </Select.Value>
      </Select.Trigger>
      <Select.Content>
        <Select.Item value={1} class="flex flex-col items-start">
          <p class="font-bold">Class 1</p>
          <p class="text-slate-500">Car, Jeepney, Van, Pick-Up, Motorcycle (400c and up)</p>
        </Select.Item>
        <Select.Item value={2} class="flex flex-col items-start">
          <p class="font-bold">Class 2</p>
          <p class="text-slate-500">Bus, Truck</p>
        </Select.Item>
        <Select.Item value={3} class="flex flex-col items-start">
          <p class="font-bold">Class 3</p>
          <p class="text-slate-500">Large Truck, Large Truck with Trailer</p>
        </Select.Item>
      </Select.Content>
    </Select.Root>
  </div>

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
                  return (
                    m.entryPoint.id === p2.id &&
                    m.exitPoint.id === p.id &&
                    m.toll_matrix.vehicleClass === vehicleClass.value
                  );
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
