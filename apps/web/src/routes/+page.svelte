<script lang="ts">
  import PointSelector from '$lib/components/ui/PointSelector.svelte';
  import { formatAmountToCurrency } from '$lib/utils.js';
  import Button from '$lib/components/ui/button/button.svelte';
  import { Sun, Moon } from 'lucide-svelte';
  import { toggleMode } from 'mode-watcher';
  import type { Point } from '$lib/data/schema.js';

  export let data;

  let pointOrigin: Point | null = null;
  let pointDestination: Point | null = null;
  let tollFee = 0;

  let pointOriginInput = '';
  let pointDestinationInput = '';

  type TollSegment = {
    entryPoint: Point;
    exitPoint: Point;
    fee: number;
  };

  let tollSegments: TollSegment[] = [];

  function queryTollMatrix(origin: Point, destination: Point) {
    let matrix = data.tollMatrix.find(
      (tm) => tm.entry_point.id === origin.id && tm.exit_point.id === destination.id
    );

    if (matrix !== null && matrix !== undefined) return matrix;

    matrix = data.tollMatrix.find(
      (tm) =>
        tm.entry_point.id === destination.id &&
        tm.exit_point.id === origin.id &&
        tm.toll_matrix.reversible
    );
    return matrix;
  }

  function calculate() {
    if (!pointOrigin || !pointDestination) return;

    if (pointOrigin.tollNetworkId === pointDestination.tollNetworkId) {
      const matrix = queryTollMatrix(pointOrigin, pointDestination);
      tollFee = matrix ? parseFloat(matrix.toll_matrix.fee ?? '0') : 0;
    } else {
      let matrix1: (typeof data.tollMatrix)[number] | undefined;
      let matrix2: (typeof data.tollMatrix)[number] | undefined;
      let fee1: number;
      let fee2: number;
      let connectedPoint1: Point;
      let connectedPoint2: Point;

      // Find which point in the same expressway as the origin is connected to another expressway
      // e.g., if origin is Carmona, then Skyway (Makati) is connected to Skyway Stage 3 via Buendia
      let connection = externalConnections.find((p) =>
        getReachables(p.externalConnectedPoint.id)
          .map((p) => p.id)
          .includes(pointDestination?.id ?? 0)
      );

      if (!connection?.externalConnectedPoint || !connection?.reachableConnectedPoint) return;

      connectedPoint1 = connection?.reachableConnectedPoint;
      connectedPoint2 = connection?.externalConnectedPoint;

      matrix1 = queryTollMatrix(pointOrigin, connectedPoint1);
      matrix2 = queryTollMatrix(connectedPoint2, pointDestination);
      fee1 = parseFloat(matrix1?.toll_matrix.fee ?? '0');
      fee2 = parseFloat(matrix2?.toll_matrix.fee ?? '0');

      tollSegments = [
        {
          entryPoint: pointOrigin,
          exitPoint: connection?.reachableConnectedPoint,
          fee: fee1,
        },
        {
          entryPoint: connection?.externalConnectedPoint,
          exitPoint: pointDestination,
          fee: fee2,
        },
      ];

      tollFee = fee1 + fee2;
    }
  }

  function getReachables(pointId: number) {
    return [
      ...data.tollMatrix.filter((tm) => tm.entry_point.id === pointId).map((tm) => tm.exit_point),
      ...data.tollMatrix
        .filter((tm) => tm.exit_point.id === pointId && tm.toll_matrix.reversible)
        .map((tm) => tm.entry_point),
    ];
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

        const connExternalConnections = getExternalConnections(connReachableIds);
        externalConnections = [...externalConnections, ...connExternalConnections];
        tempExternalConnections = [...tempExternalConnections, ...connExternalConnections];
      }
    }

    externalReachables = externalConnections
      .map((c) => getReachables(c.externalConnectedPoint.id))
      .reduce((acc, val) => acc.concat(val), []);
  }

  $: reachables = [...originReachables, ...externalReachables].map(
    (c) => data.points.find((p) => p.id === c.id) ?? c
  );
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
    <div class="flex flex-col gap-4">
      <div
        class="flex flex-col gap-2 rounded-lg bg-gray-200 p-5 dark:bg-gray-800 dark:text-gray-200">
        <div class="flex flex-col">
          <h2 class="text-gray-500">Total Toll Fees</h2>
          <div class="flex flex-col gap-5">
            <p class="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-200">
              {formatAmountToCurrency(tollFee)}
            </p>
          </div>
        </div>

        <div class="flex flex-col">
          {#each tollSegments as segment}
            <div class="flex flex-row justify-between">
              <p>{segment.entryPoint.name} ~ {segment.exitPoint.name}</p>
              <p>{formatAmountToCurrency(segment.fee)}</p>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>
