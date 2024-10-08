<script lang="ts">
  import * as Select from '$lib/components/ui/select';
  import * as Table from '$lib/components/ui/table';
  import type { Point } from '$lib/data/schema.js';
  import Header from '$lib/components/ui/Header.svelte';
  import { Input } from '$lib/components/ui/input';

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

  function updateFee(entryPointId: number, exitPointId: number, value: string) {
    console.log(entryPointId, exitPointId, value);
    fetch('/api/matrix', {
      method: 'POST',
      body: JSON.stringify({
        entryPointId,
        exitPointId,
        vehicleClass: vehicleClass.value,
        fee: value,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log(data);
      });
  }
</script>

<svelte:head>
  <title>Toll Fee Matrix Philippines</title>
  <meta name="robots" content="index, follow" />
  <meta name="application-name" content="Toll.ph" />
  <meta name="description" content="Philippine Toll Fee Matrix" />
  <meta
    name="keywords"
    content="Philippines, Expressways, Toll, NLEX, SLEX, SCTEX, TPLEX, CALAX, CAVITEX, NAIAX, calculator, matrix, Baguio" />
</svelte:head>

<div class="flex flex-col items-center">
  <div class="mx-5 flex w-11/12 flex-col gap-10 pt-5">
    <Header showCalculatorButton />

    <div>
      <h2 class="text-2xl font-bold tracking-tight">Toll Matrix/Table</h2>
    </div>

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

    <div class="flex flex-row gap-5">
      <p>Jump to:</p>

      {#each data.tollNetworks as tollNetwork}
        <a href="#{tollNetwork.id}" class="text-slate-500 hover:underline">{tollNetwork.name}</a>
      {/each}
    </div>

    <div class="flex flex-col gap-10">
      {#each data.tollNetworks as tollNetwork}
        <div class="flex flex-col gap-2">
          <h3 class="text-xl font-bold" id={tollNetwork.id}>{tollNetwork.name}</h3>

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
                    <Table.Cell>
                      {#if m?.fee}
                        <Input
                          value={parseInt(m?.fee ?? '') ?? 0}
                          class="w-16"
                          on:blur={(event) => {
                            updateFee(m.entryPointId, m.exitPointId, event.target.value);
                          }} />
                      {/if}
                      <!-- {m?.fee ?? ''}{m?.fee ? (m?.reversible ? '' : '*') : ''} -->
                    </Table.Cell>
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
