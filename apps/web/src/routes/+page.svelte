<script lang="ts">
  import PointSelector from '$lib/components/ui/PointSelector.svelte';
  import Trip from '$lib/components/ui/Trip.svelte';
  import { formatAmountToCurrency } from '$lib/utils.js';
  import Button from '$lib/components/ui/button/button.svelte';
  import { Sun, Moon } from 'lucide-svelte';
  import { toggleMode } from 'mode-watcher';
  import type { Point } from '$lib/data/schema.js';
  import type { TollSegment, TripResult } from '$lib/types.js';
  import { onMount } from 'svelte';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import * as Select from '$lib/components/ui/select';

  export let data;

  let pointOrigin: Point | null = null;
  let pointDestination: Point | null = null;
  let tollFee = 0;

  let pointOriginInput = '';
  let pointDestinationInput = '';

  let tollSegments: TollSegment[] = [];

  let savedTrips = [] as TripResult[];
  let localStorageLoaded = false;

  onMount(() => {
    savedTrips = JSON.parse(localStorage.getItem('savedTrips') ?? '[]');
    localStorageLoaded = true;
  });

  $: {
    if (localStorageLoaded) {
      localStorage.setItem('savedTrips', JSON.stringify(savedTrips));
    }
  }

  function saveResult() {
    if (tollFee === 0) return;

    savedTrips = [
      ...savedTrips,
      {
        totalFee: tollFee,
        tollSegments,
      },
    ];
  }

  function deleteTrip(trip: TripResult) {
    savedTrips = savedTrips.filter((t) => t !== trip);
  }

  function queryTollMatrix(origin: Point, destination: Point) {
    let matrix = data.tollMatrix.find(
      (tm) => tm.entry_point.id === origin.id && tm.exit_point.id === destination.id
    );

    if (matrix !== null && matrix !== undefined) return parseFloat(matrix?.toll_matrix.fee ?? '0');

    matrix = data.tollMatrix.find(
      (tm) =>
        tm.entry_point.id === destination.id &&
        tm.exit_point.id === origin.id &&
        tm.toll_matrix.reversible
    );
    return parseFloat(matrix?.toll_matrix.fee ?? '0');
  }

  function calculate() {
    if (!pointOrigin || !pointDestination) return;

    tollSegments = [];
    tollFee = 0;

    if (pointOrigin.tollNetworkId === pointDestination.tollNetworkId) {
      tollSegments = [
        {
          entryPoint: { ...pointOrigin },
          exitPoint: { ...pointDestination },
          fee: queryTollMatrix(pointOrigin, pointDestination),
        },
      ];

      tollFee = queryTollMatrix(pointOrigin, pointDestination);
    } else {
      console.log('externalConnections', externalConnections);
      console.log('externalReachables', externalReachables);

      let currentDestination = pointDestination;

      for (let i = 0; i < externalConnections.length; i++) {
        const conn = { ...externalConnections[i] };

        if (currentDestination.tollNetworkId === pointOrigin.tollNetworkId) {
          const fee = queryTollMatrix(pointOrigin, currentDestination);
          tollSegments = [
            {
              entryPoint: { ...pointOrigin },
              exitPoint: { ...currentDestination },
              fee,
            },
            ...tollSegments,
          ];
          tollFee += fee;

          break;
        } else {
          const connReachables = getReachables(conn.externalConnectedPoint.id);
          const connReachableIds = connReachables.map((c) => c.id);

          if (connReachableIds.includes(currentDestination.id)) {
            const fee = queryTollMatrix(conn.externalConnectedPoint, currentDestination);
            tollSegments = [
              {
                entryPoint: { ...conn.externalConnectedPoint },
                exitPoint: { ...currentDestination },
                fee,
              },
              ...tollSegments,
            ];
            tollFee += fee;
            currentDestination = { ...conn.reachableConnectedPoint };

            i = -1;
          }
        }
      }
    }
  }

  function getReachables(pointId: number) {
    const returnValue = [
      ...data.tollMatrix.filter((tm) => tm.entry_point.id === pointId).map((tm) => tm.exit_point),
      ...data.tollMatrix
        .filter((tm) => tm.exit_point.id === pointId && tm.toll_matrix.reversible)
        .map((tm) => tm.entry_point),
    ];

    // this is crazy, but this is needed to allow southbound connections to NAIAX (e.g., Skyway Buendia to NAIAX)
    if (pointId === 1) {
      const point1 = data.points.find((p) => p.id === 1);
      if (point1) {
        returnValue.push(point1);
      }
    }

    return returnValue;
  }

  function getExternalConnections(reachablePointIds: number[]) {
    const conn = data.connections
      .filter((c) => reachablePointIds.includes(c.point.id))
      .map((c) => ({
        reachableConnectedPoint: c.point,
        externalConnectedPoint: c.connecting_point,
      }));

    const connReversed = data.connections
      .filter((c) => reachablePointIds.includes(c.connecting_point.id))
      .map((c) => ({
        reachableConnectedPoint: c.connecting_point,
        externalConnectedPoint: c.point,
      }));

    return [...conn, ...connReversed];
  }

  $: originReachables = getReachables(pointOrigin?.id ?? 0);
  $: originReachablesPointIds = originReachables.map((c) => c.id);

  let externalConnections: ReturnType<typeof getExternalConnections> = [];
  let externalReachables: Point[] = [];

  $: {
    externalConnections = getExternalConnections(originReachablesPointIds);
    let tempExternalConnections = [...externalConnections];

    while (tempExternalConnections.length > 0) {
      const l = [...tempExternalConnections];
      tempExternalConnections = [];
      for (const conn of [...l]) {
        const connReachables = getReachables(conn.externalConnectedPoint.id);
        const connReachableIds = connReachables.map((c) => c.id);

        const connExternalConnections = getExternalConnections(connReachableIds).filter((c) => {
          return !externalConnections.some(
            (ec) => ec.externalConnectedPoint.id === c.externalConnectedPoint.id
          );
        });
        externalConnections = [...externalConnections, ...connExternalConnections];
        tempExternalConnections = [...tempExternalConnections, ...connExternalConnections];
      }
    }

    externalReachables = externalConnections
      .map((c) => getReachables(c.externalConnectedPoint.id))
      .reduce((acc, val) => acc.concat(val), []);
  }

  $: reachables = [...originReachables, ...externalReachables]
    .map((c) => data.points.find((p) => p.id === c.id) ?? c)
    .reduce((acc, val) => {
      if (!acc.find((p) => p.id === val.id)) acc.push(val);
      return acc;
    }, [] as Point[]);

  let vehicleClass = { value: 1, label: 'Class 1' };
  let vehicleClassList = [
    { value: 1, label: 'Class 1' },
    { value: 2, label: 'Class 2' },
    { value: 3, label: 'Class 3' },
  ];

  $: console.log(vehicleClass.value);
</script>

<div class="mx-5 flex flex-col gap-10 sm:mx-auto sm:w-3/5 sm:pt-5 md:w-1/2 lg:w-2/5 xl:w-4/12">
  <div class="flex place-content-between place-items-center">
    <h1 class="text-3xl font-bold text-slate-950 dark:text-slate-300">toll.ph</h1>

    <Button on:click={toggleMode} variant="outline" size="icon">
      <Sun
        class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon
        class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span class="sr-only">Toggle theme</span>
    </Button>
  </div>

  <div class="flex flex-col gap-5">
    <div class="flex flex-col gap-2">
      <h3 class="font-bold text-slate-700 dark:text-slate-300">Vehicle Class</h3>
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
          <Select.Item value="1" class="flex flex-col items-start">
            <p class="font-bold">Class 1</p>
            <p class="text-slate-500">Car, Jeepney, Van, Pick-Up, Motorcycle (400c and up)</p>
          </Select.Item>
          <Select.Item value="2" class="flex flex-col items-start">
            <p class="font-bold">Class 2</p>
            <p class="text-slate-500">Bus, Truck</p>
          </Select.Item>
          <Select.Item value="3" class="flex flex-col items-start">
            <p class="font-bold">Class 3</p>
            <p class="text-slate-500">Large Truck, Large Truck with Trailer</p>
          </Select.Item>
        </Select.Content>
      </Select.Root>
    </div>

    <div class="flex flex-col gap-2">
      <h3 class="font-bold text-slate-700 dark:text-slate-300">Origin</h3>
      <PointSelector
        bind:input={pointOriginInput}
        points={data.points}
        placeholder="Enter point of origin"
        bind:setPoint={pointOrigin} />
    </div>

    <div class="flex flex-col gap-2">
      <h3 class="font-bold text-slate-700 dark:text-slate-300">Destination</h3>
      <PointSelector
        bind:input={pointDestinationInput}
        points={reachables}
        placeholder="Enter point of destination"
        bind:setPoint={pointDestination} />
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <button
      class="rounded-md bg-green-300 py-3 font-bold text-green-800 transition duration-100 hover:bg-green-400 dark:bg-green-800 dark:text-green-200 dark:hover:bg-green-700"
      on:click={calculate}>Calculate</button>
    <button
      class="rounded-md bg-gray-200 py-3 font-bold text-gray-600 transition duration-100 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
      on:click={() => {
        pointOrigin = null;
        pointDestination = null;
        pointOriginInput = '';
        pointDestinationInput = '';
        tollFee = 0;
        tollSegments = [];
      }}>Clear</button>
  </div>

  {#if tollFee > 0}
    <div
      class="flex flex-col gap-5 rounded-lg bg-slate-100 p-5 dark:bg-slate-900 dark:text-slate-200">
      <div class="flex flex-row justify-between">
        <div class="flex flex-col">
          <h2 class="text-gray-500">Total Toll Fees</h2>
          <div class="flex flex-col gap-5">
            <p class="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-200">
              {formatAmountToCurrency(tollFee)}
            </p>
          </div>
        </div>

        <Button
          class="bg-slate-300 text-slate-600 hover:bg-slate-400 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          on:click={saveResult}>Save</Button>
      </div>

      <div class="flex flex-col gap-1">
        {#each tollSegments as segment}
          <div class="flex flex-row justify-between">
            <div class="flex flex-1 flex-row gap-1">
              <p class="flex-1 text-slate-500 dark:text-slate-500">
                {segment.entryPoint.expresswayId}
              </p>
            </div>
            {#if segment.entryPoint.id === segment.exitPoint.id}
              <p class="flex-1 text-center">{segment.entryPoint.name}</p>
            {:else}
              <div class="flex flex-row gap-2">
                <p class="">{segment.entryPoint.name}</p>
                <p class="text-slate-500 dark:text-slate-500">→</p>
                <p class="">{segment.exitPoint.name}</p>
              </div>
            {/if}

            <div class="flex flex-1 flex-row gap-2">
              <p class="flex-1 text-right text-slate-500 dark:text-slate-500">
                {formatAmountToCurrency(segment.fee)}
              </p>

              <Tooltip.Root openDelay={200}>
                <Tooltip.Trigger>
                  {#if segment.entryPoint.rfid === 'AUTOSWEEP'}
                    <div
                      class="rounded-lg bg-green-300 px-2 py-1 font-mono text-xs text-green-700 dark:bg-green-700 dark:text-green-200">
                      A
                    </div>
                  {:else}
                    <div
                      class="rounded-lg bg-blue-300 px-2 py-1 font-mono text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-400">
                      E
                    </div>
                  {/if}
                </Tooltip.Trigger>
                <Tooltip.Content>
                  {#if segment.entryPoint.rfid === 'AUTOSWEEP'}
                    <p>AutoSweep RFID</p>
                  {:else}
                    <p>EasyTrip RFID</p>
                  {/if}
                </Tooltip.Content>
              </Tooltip.Root>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if savedTrips.length > 0}
    <div class="flex flex-col gap-5">
      <div class="w-full border-b border-b-slate-200 dark:border-b-slate-800" />
      <h3 class="text-center text-sm text-slate-700">saved trips</h3>

      <div class="flex flex-col gap-5">
        {#each savedTrips as trip}
          <Trip
            {trip}
            on:delete={() => {
              deleteTrip(trip);
            }} />
        {/each}
      </div>

      <p class="mb-5 text-center text-sm text-slate-700">
        total amount: {formatAmountToCurrency(
          savedTrips.reduce((acc, val) => acc + val.totalFee, 0)
        )}
      </p>
    </div>
  {/if}
</div>
