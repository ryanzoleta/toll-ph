<script lang="ts">
  import * as Select from '$lib/components/ui/select';
  import * as Table from '$lib/components/ui/table';
  import type { Point } from '$lib/data/schema.js';
  import Header from '$lib/components/ui/Header.svelte';
  import MatrixTable from '$lib/components/ui/MatrixTable.svelte';
  import Coffee from '$lib/components/ui/Coffee.svelte';
  import { Button } from '$lib/components/ui/button';

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
    <Header />

    <div class="flex flex-col items-center gap-5 md:flex-row md:justify-between">
      <h2 class="text-2xl font-bold tracking-tight">Toll Matrix/Table</h2>
    </div>

    <div class="flex flex-col gap-5 rounded-xl bg-slate-100 p-5 md:w-1/3 dark:bg-slate-900">
      <p>Jump to:</p>

      <div class="flex flex-col gap-1">
        {#each data.tollNetworks as tollNetwork}
          <a href="#{tollNetwork.id}" class="text-slate-600 hover:underline dark:text-slate-400"
            >{tollNetwork.name}</a>
        {/each}
      </div>
    </div>

    <div class="flex flex-col gap-5">
      <div
        class="flex w-full flex-row items-center gap-3 rounded-xl border border-green-500 bg-green-100 p-5 md:w-fit dark:bg-green-950">
        <p class="text-lg">Driving across <span class="italic">multiple</span> expressways?</p>
        <Button href="/" class="w-fit">Try the Calculator!</Button>
      </div>
    </div>

    <div class="flex flex-col gap-2 md:w-1/3">
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
        <div
          class="flex flex-col gap-5 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
          <div class="flex flex-col gap-2">
            <h3 class="text-2xl font-bold" id={tollNetwork.id}>{tollNetwork.name}</h3>

            <div class="flex flex-row gap-3 dark:text-slate-500">
              {#each data.expressways.filter((e) => e.tollNetworkId === tollNetwork.id) as expressway, index}
                <p>{expressway.name}</p>

                {#if index < data.expressways.filter((e) => e.tollNetworkId === tollNetwork.id).length - 1}
                  <p>•</p>
                {/if}
              {/each}
            </div>
          </div>

          <MatrixTable {tollNetwork} tollMatrix={data.tollMatrix} {vehicleClass} />
        </div>
      {/each}
    </div>
  </div>
</div>
