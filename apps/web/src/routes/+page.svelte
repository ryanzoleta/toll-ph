<script lang="ts">
  import PointSelector from '$lib/components/ui/PointSelector.svelte';
  import Trip from '$lib/components/ui/Trip.svelte';
  import { formatAmountToCurrency } from '$lib/utils.js';
  import Button from '$lib/components/ui/button/button.svelte';
  import Header from '$lib/components/ui/Header.svelte';
  import type { Point } from '$lib/data/schema.js';
  import type { TollSegment, TripResult } from '$lib/types.js';
  import { onMount } from 'svelte';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import * as Select from '$lib/components/ui/select';
  import Sortable from 'sortablejs';
  import Coffee from '$lib/components/ui/Coffee.svelte';
  import { fade } from 'svelte/transition';
  import posthog from 'posthog-js';

  export let data;

  let pointOrigin: Point | null = null;
  let pointDestination: Point | null = null;
  let tollFee = 0;
  let autoSweepTotal = 0;
  let easyTripTotal = 0;

  let pointOriginInput = '';
  let pointDestinationInput = '';

  let tollSegments: TollSegment[] = [];

  let savedTrips = [] as TripResult[];
  let localStorageLoaded = false;
  let savedResult = false;

  let usageCount = 0;

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
        vehicleClass: vehicleClass.value,
      },
    ];

    savedResult = true;
  }

  function deleteTrip(trip: TripResult) {
    savedTrips = savedTrips.filter((t) => t !== trip);
  }

  function queryTollMatrix(origin: Point, destination: Point) {
    let matrix = data.tollMatrix.find(
      (tm) =>
        tm.entry_point.id === origin.id &&
        tm.exit_point.id === destination.id &&
        tm.toll_matrix.vehicleClass === vehicleClass.value
    );

    if (matrix !== null && matrix !== undefined) return parseFloat(matrix?.toll_matrix.fee ?? '0');

    matrix = data.tollMatrix.find(
      (tm) =>
        tm.entry_point.id === destination.id &&
        tm.exit_point.id === origin.id &&
        tm.toll_matrix.reversible &&
        tm.toll_matrix.vehicleClass === vehicleClass.value
    );
    return parseFloat(matrix?.toll_matrix.fee ?? '0');
  }

  function calculate(pointOrigin: Point | null, pointDestination: Point | null) {
    posthog.capture('calculate', {
      vehicleClass: vehicleClass.value,
      pointOrigin,
      pointDestination,
    });

    usageCount += 1;
    console.log('calculate start');
    if (!pointOrigin || !pointDestination) return;
    console.log('calculate not returned');

    tollSegments = [];
    tollFee = 0;
    easyTripTotal = 0;
    autoSweepTotal = 0;
    savedResult = false;

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

      for (let segment of tollSegments) {
        if (segment.entryPoint.rfid === 'AUTOSWEEP') {
          autoSweepTotal += segment.fee;
        } else {
          easyTripTotal += segment.fee;
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

  let container: HTMLDivElement;

  $: if (container) {
    new Sortable(container, {
      animation: 150,
      handle: '.dragger',
      draggable: '.tripContainer',
      onEnd: (evt) => {
        if (
          evt.oldDraggableIndex !== undefined &&
          evt.newDraggableIndex !== undefined &&
          evt.oldDraggableIndex !== evt.newDraggableIndex
        ) {
          const savedTripsCopy = [...savedTrips];
          const newSavedTrips = [];
          for (let i = 0; i < savedTripsCopy.length; i++) {
            if (i === evt.newDraggableIndex) {
              if (evt.newDraggableIndex < evt.oldDraggableIndex) {
                newSavedTrips.push(savedTripsCopy[evt.oldDraggableIndex]);
                newSavedTrips.push(savedTripsCopy[i]);
              } else {
                newSavedTrips.push(savedTripsCopy[i]);
                newSavedTrips.push(savedTripsCopy[evt.oldDraggableIndex]);
              }
            } else if (i === evt.oldDraggableIndex) {
              // do nothing
            } else {
              newSavedTrips.push(savedTripsCopy[i]);
            }
          }

          savedTrips = [...newSavedTrips];
        }
      },
    });
  }
</script>

<svelte:head>
  <title>Toll Calculator Philippines</title>
  <meta name="robots" content="index, follow" />
  <meta name="application-name" content="Toll.ph" />
  <meta name="description" content="Philippine Toll Fee Calculator" />
  <meta
    name="keywords"
    content="Philippines, Expressways, Toll, NLEX, SLEX, SCTEX, TPLEX, CALAX, CAVITEX, NAIAX, calculator, Baguio, Toll Pinas, Toll Pilipinas, Toll Guru" />
</svelte:head>

<div class="mx-5 flex flex-col gap-5 sm:mx-auto sm:w-3/5 sm:pt-5 md:w-1/2 lg:w-2/5 xl:w-4/12">
  <Header />

  <div class="flex flex-col gap-5">
    <p class="text-sm text-slate-500">
      Use this to calculate the toll fee for a trip in the entire Philippine Luzon expressway
      network, from Baguio to Batangas to Cavite.
    </p>

    <div class="flex flex-col gap-2">
      <h3 class="font-bold text-slate-700 dark:text-slate-300">Vehicle Class</h3>

      <Select.Root bind:selected={vehicleClass} items={vehicleClassList}>
        <Select.Trigger class="h-fit border-0 bg-slate-200 p-3 text-base dark:bg-slate-800">
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
      class="plausible-event-name={vehicleClass.value === 2
        ? 'calculate-2'
        : vehicleClass.value === 3
        ? 'calculate-3'
        : 'calculate'} rounded-md bg-green-300 py-3 font-bold text-green-800 transition duration-100 hover:bg-green-400 dark:bg-green-800 dark:text-green-200 dark:hover:bg-green-700"
      on:click={() => {
        calculate(pointOrigin, pointDestination);
      }}>Calculate</button>
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
      class="flex flex-col gap-5 rounded-lg bg-slate-100 p-5 dark:bg-slate-900 dark:text-slate-200"
      in:fade={{ duration: 100 }}>
      <div class="flex flex-row items-center justify-between">
        <div class="flex flex-col">
          <h2 class="text-lg font-light text-gray-500">
            {pointOrigin?.name} → {pointDestination?.name}
          </h2>
          <div class="flex flex-col gap-5">
            <p class="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-200">
              {formatAmountToCurrency(tollFee)}
            </p>
          </div>
        </div>

        {#if savedResult}
          <p class="hidden text-center text-sm text-slate-500 md:block">Saved!</p>
        {:else}
          <Button
            class="hidden bg-slate-300 text-slate-600 hover:bg-slate-400 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 md:block"
            on:click={saveResult}>Save</Button>
        {/if}
      </div>

      <div class="flex flex-col gap-1 text-sm md:text-base">
        {#each tollSegments as segment}
          <div class="flex flex-row justify-between">
            <div class="hidden flex-1 flex-row items-center gap-1 md:flex">
              <p class="flex-1 text-slate-500 dark:text-slate-500">
                {segment.entryPoint.expresswayId}
              </p>
            </div>
            {#if segment.entryPoint.id === segment.exitPoint.id}
              <p class="flex-1 text-center">{segment.entryPoint.name}</p>
            {:else}
              <div class="flex flex-row items-center gap-2">
                <p class="">{segment.entryPoint.name}</p>
                <p class="text-slate-500 dark:text-slate-500">→</p>
                <p class="">{segment.exitPoint.name}</p>
                <p class="block text-slate-500 md:hidden">({segment.entryPoint.expresswayId})</p>
              </div>
            {/if}

            <div class="flex flex-1 flex-row items-center gap-2">
              <p class="flex-1 text-right text-slate-500 dark:text-slate-500">
                {formatAmountToCurrency(segment.fee)}
              </p>

              <Tooltip.Root openDelay={100}>
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

      {#if autoSweepTotal > 0 && easyTripTotal > 0}
        <hr />

        <div class="flex flex-col gap-1 text-sm md:text-base">
          <div class="flex flex-row items-center justify-between">
            <div class="flex flex-row items-center gap-1">
              <div
                class="rounded-lg bg-green-300 px-2 py-1 font-mono text-xs text-green-700 dark:bg-green-700 dark:text-green-200">
                A
              </div>

              <p class="text-green-700">AutoSweep Total</p>
            </div>

            <p class="text-green-700">{formatAmountToCurrency(autoSweepTotal)}</p>
          </div>

          <div class="flex flex-row justify-between">
            <div class="flex flex-row items-center gap-1">
              <div
                class="items-center rounded-lg bg-blue-300 px-2 py-1 font-mono text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-400">
                E
              </div>
              <p class="text-blue-700">EasyTrip Total</p>
            </div>

            <p class="text-blue-700">{formatAmountToCurrency(easyTripTotal)}</p>
          </div>
        </div>
      {/if}

      {#if savedResult}
        <p class="block text-center text-sm text-slate-500 md:hidden">Saved!</p>
      {:else}
        <Button
          class="block bg-slate-300 text-slate-600 hover:bg-slate-400 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 md:hidden"
          on:click={saveResult}>Save</Button>
      {/if}
    </div>
  {/if}

  {#if tollFee <= 0}
    <div class="flex flex-row flex-wrap items-center justify-center gap-2">
      <button
        class="bg-muted rounded-lg p-2 text-xs text-slate-400"
        on:click={() => {
          const po =
            data.points.find(
              (p) => p.name?.toLowerCase() === 'buendia' && p.expresswayId === 'SKYWAY'
            ) ?? null;
          const pd = data.points.find((p) => p.name?.toLowerCase() === 'batangas') ?? null;
          pointOrigin = po;
          pointDestination = pd;
          setTimeout(() => {
            calculate(po, pd);
          }, 1);
        }}>Buendia → Batangas</button>
      <button
        class="bg-muted rounded-lg p-2 text-xs text-slate-400"
        on:click={() => {
          const po =
            data.points.find(
              (p) => p.name?.toLowerCase() === 'balintawak' && p.expresswayId === 'NLEX'
            ) ?? null;
          const pd = data.points.find((p) => p.name?.toLowerCase() === 'rosario/baguio') ?? null;
          pointOrigin = po;
          pointDestination = pd;
          setTimeout(() => {
            calculate(po, pd);
          }, 1);
        }}>Balintawak → Baguio</button>
      <button
        class="bg-muted rounded-lg p-2 text-xs text-slate-400"
        on:click={() => {
          const po = data.points.find((p) => p.name?.toLowerCase() === 'calamba') ?? null;
          const pd = data.points.find((p) => p.name?.toLowerCase() === 'naia terminal 1') ?? null;
          pointOrigin = po;
          pointDestination = pd;
          setTimeout(() => {
            calculate(po, pd);
          }, 1);
        }}>Calamba → NAIA T1</button>

      <button
        class="bg-muted rounded-lg p-2 text-xs text-slate-400"
        on:click={() => {
          const po = data.points.find((p) => p.name?.toLowerCase() === 'bacoor') ?? null;
          const pd = data.points.find((p) => p.name?.toLowerCase() === 'tipo/subic') ?? null;
          pointOrigin = po;
          pointDestination = pd;
          setTimeout(() => {
            calculate(po, pd);
          }, 1);
        }}>Bacoor → Subic</button>
    </div>
  {:else if usageCount > 1}
    <div>
      <Coffee />
    </div>
  {/if}

  {#if savedTrips.length > 0}
    <div class="flex flex-col gap-5">
      <div class="w-full border-b border-b-slate-200 dark:border-b-slate-800" />
      <h3 class="text-center text-sm text-slate-700">saved trips</h3>

      <div class="flex flex-col gap-5" bind:this={container}>
        {#key savedTrips}
          {#each savedTrips as trip}
            <Trip
              {trip}
              on:delete={() => {
                deleteTrip(trip);
              }} />
          {/each}
        {/key}
      </div>

      <p class="mb-5 text-center text-sm text-slate-700">
        total amount: {formatAmountToCurrency(
          savedTrips.reduce((acc, val) => acc + val.totalFee, 0)
        )}
      </p>
    </div>
  {/if}

  <div class="h-56 w-1 md:h-0" />
</div>
