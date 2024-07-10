<script lang="ts">
  import * as Select from '$lib/components/ui/select';
  import * as Table from '$lib/components/ui/table';
  import type { Point } from '$lib/data/schema.js';
  import Header from '$lib/components/ui/Header.svelte';

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

<div class="flex flex-col items-center">
  <div class="mx-5 flex w-11/12 flex-col gap-10 pt-5">
    <Header />

    <div class="flex flex-col gap-2 sm:w-1/3">
      <h3 class="font-bold text-slate-700 dark:text-slate-300">Vehicle Class</h3>

      <Select.Root bind:selected={vehicleClass} items={vehicleClassList}>
        <Select.Trigger class="">
          <Select.Value placeholder="Vehicle Class" asChild let:label>
            {#if label}
              <p class="font-bold">{label.substring(0, 8)}</p>
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

    <div class="flex flex-col gap-10">
      {#each data.tollNetworks as tollNetwork}
        <div class="flex flex-col gap-2">
          <h3 class="font-bold">{tollNetwork.name}</h3>

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
                    <Table.Cell
                      >{m?.fee ?? ''}{m?.fee ? (m?.reversible ? '' : '*') : ''}</Table.Cell>
                  {/each}
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </div>
      {/each}
    </div>
  </div>
</div>
