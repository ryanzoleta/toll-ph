<script lang="ts">
  import PointSelector from '$lib/components/ui/PointSelector.svelte';
  import Trip from '$lib/components/ui/Trip.svelte';
  import { formatAmountToCurrency, formatNumber } from '$lib/utils.js';
  import Button from '$lib/components/ui/button/button.svelte';
  import { getRemainingTrialDays, isSubscribed } from '$lib/payments';
  import type { Point, SavedTrip } from '$lib/data/schema.js';
  import type { TollSegment, TripResult } from '$lib/types.js';
  import { onMount } from 'svelte';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import * as Select from '$lib/components/ui/select';
  import Sortable from 'sortablejs';
  import Coffee from '$lib/components/ui/Coffee.svelte';
  import { fade } from 'svelte/transition';
  import HeaderPro from '$lib/components/HeaderPro.svelte';
  import type { User } from '$lib/data/schema';
  import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
  import * as Table from '$lib/components/ui/table';
  import SavedTripRow from '$lib/components/SavedTripRow.svelte';
  import { calculate, getExternalConnections, getReachables } from '$lib/calculate.js';
  import { Loader2Icon, TriangleAlertIcon } from 'lucide-svelte';
  import { authClient } from '$lib/auth-client.js';

  export let data;

  const session = data.session;
  const user = (data.session.user as User) ?? null;

  const points = data.points ?? [];
  const tollMatrix = data.tollMatrix ?? [];
  const connections = data.connections ?? [];

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

    if (!pointOrigin || !pointDestination) return;

    $addSavedTrip.mutate({
      pointOriginId: pointOrigin.id,
      pointDestinationId: pointDestination.id,
      vehicleClass: vehicleClass.value,
    });

    savedResult = true;
  }

  function deleteTrip(trip: TripResult) {
    savedTrips = savedTrips.filter((t) => t !== trip);
  }

  function calculateSolo(pointOrigin: Point | null, pointDestination: Point | null) {
    console.log('calculate start');
    if (!pointOrigin || !pointDestination) return;
    console.log('calculate not returned');

    const result = calculate(
      pointOrigin,
      pointDestination,
      vehicleClass.value,
      points,
      tollMatrix,
      connections
    );

    tollSegments = result.tollSegments ?? [];
    tollFee = result.tollFee;
    easyTripTotal = result.easyTripTotal;
    autoSweepTotal = result.autoSweepTotal;
    savedResult = false;
  }

  $: originReachables = getReachables(pointOrigin?.id ?? 0, tollMatrix, points);
  $: originReachablesPointIds = originReachables.map((c) => c.id);

  let externalConnections: ReturnType<typeof getExternalConnections> = [];
  let externalReachables: Point[] = [];

  $: {
    externalConnections = getExternalConnections(originReachablesPointIds, connections);
    let tempExternalConnections = [...externalConnections];

    while (tempExternalConnections.length > 0) {
      const l = [...tempExternalConnections];
      tempExternalConnections = [];
      for (const conn of [...l]) {
        const connReachables = getReachables(conn.externalConnectedPoint.id, tollMatrix, points);
        const connReachableIds = connReachables.map((c) => c.id);

        const connExternalConnections = getExternalConnections(
          connReachableIds,
          connections
        ).filter((c) => {
          return !externalConnections.some(
            (ec) => ec.externalConnectedPoint.id === c.externalConnectedPoint.id
          );
        });
        externalConnections = [...externalConnections, ...connExternalConnections];
        tempExternalConnections = [...tempExternalConnections, ...connExternalConnections];
      }
    }

    externalReachables = externalConnections
      .map((c) => getReachables(c.externalConnectedPoint.id, tollMatrix, points))
      .reduce((acc, val) => acc.concat(val), []);
  }

  $: reachables = [...originReachables, ...externalReachables]
    .map((c) => points.find((p: Point) => p.id === c.id) ?? c)
    .reduce((acc, val) => {
      if (!acc.find((p: Point) => p.id === val.id)) acc.push(val);
      return acc;
    }, [] as Point[]);

  let vehicleClass = { value: 2, label: 'Class 2' };
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

  const savedTripsQuery = createQuery({
    queryKey: ['savedTrips'],
    queryFn: async () => {
      const response = await fetch('/api/saved');
      return (await response.json()) as SavedTrip[];
    },
  });

  const queryClient = useQueryClient();

  const addSavedTrip = createMutation({
    mutationFn: async ({
      pointOriginId,
      pointDestinationId,
      vehicleClass,
    }: {
      pointOriginId: number;
      pointDestinationId: number;
      vehicleClass: number;
    }) => {
      const response = (await (
        await fetch('/api/saved', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pointOriginId,
            pointDestinationId,
            vehicleClass,
          }),
        })
      ).json()) as Omit<SavedTrip, 'id' | 'createdAt' | 'updatedAt' | 'sequence'>;
      return response;
    },
    onMutate: async (
      savedTrip: Omit<SavedTrip, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'sequence'>
    ) => {
      await queryClient.cancelQueries({ queryKey: ['savedTrips'] });
      const previousTransactions = queryClient.getQueryData<SavedTrip[]>(['savedTrips']);
      queryClient.setQueryData<
        Omit<SavedTrip, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'sequence'>[]
      >(['savedTrips'], (old) => {
        return [...(old ?? []), savedTrip];
      });

      return { previousTransactions };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['savedTrips'] });
    },
  });

  const updateSavedTrip = createMutation({
    mutationFn: async ({ id, sequence }: { id: number; sequence: number }) => {
      const response = (await (
        await fetch(`/api/saved/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sequence }),
        })
      ).json()) as SavedTrip;
      return response;
    },
    onMutate: async ({ id, sequence }: { id: number; sequence: number }) => {
      await queryClient.cancelQueries({ queryKey: ['savedTrips'] });
      const previousTransactions = queryClient.getQueryData<SavedTrip[]>(['savedTrips']);
      queryClient.setQueryData<SavedTrip[]>(['savedTrips'], (old) => {
        return old?.map((t) => (t.id === id ? { ...t, sequence } : t)) ?? [];
      });
      return { previousTransactions };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['savedTrips'] });
    },
  });

  $: totalFees = $savedTripsQuery.data
    ? $savedTripsQuery.data.reduce(
        (acc, val) =>
          acc +
          calculate(
            points.find((p: Point) => p.id === val.pointOriginId) ?? null,
            points.find((p: Point) => p.id === val.pointDestinationId) ?? null,
            val.vehicleClass,
            points,
            tollMatrix,
            connections
          ).tollFee,
        0
      )
    : 0;

  const isProQuery = createQuery({
    queryKey: ['isPro', user.id],
    queryFn: async () => {
      return await isSubscribed(user);
    },
  });
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

<HeaderPro {session} {user} isPro={data.isPro} />

<main class="flex w-full flex-1 flex-col items-center">
  <div class="flex h-full w-full flex-1 flex-col md:flex-row">
    <div
      class=" flex w-full flex-col gap-5 border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-8 md:w-1/2 md:border-b-0 md:border-r md:px-5 lg:px-10 xl:w-1/3">
      <h2 class="text-2xl font-bold">Calculator</h2>

      {#if !$isProQuery.isLoading}
        {#if !$isProQuery.data}
          <div
            class="flex flex-col items-start justify-between gap-2 rounded-lg border border-orange-300 bg-orange-100 px-4 py-4 text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200 sm:flex-row md:flex-col md:items-center xl:flex-row">
            <div class="flex flex-row items-center gap-2">
              <TriangleAlertIcon class="h-6 w-6 text-orange-500" />
              <p>Your trial will end in {getRemainingTrialDays(user)} days</p>
            </div>

            <Button variant="link" class="self-end text-base text-orange-500" href="/paywall"
              >Subscribe Now</Button>
          </div>
        {/if}
      {/if}

      <div class="flex flex-col gap-5">
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
            {points}
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
            calculateSolo(pointOrigin, pointDestination);
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
                <p
                  class="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-200">
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
                    <p class="block text-slate-500 md:hidden">
                      ({segment.entryPoint.expresswayId})
                    </p>
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
    </div>

    <div class="flex-1 space-y-5 px-10 py-5">
      <h2 class="text-2xl font-bold">Saved Trips</h2>

      {#if $savedTripsQuery.isLoading}
        <div class="flex h-full flex-row items-center justify-center">
          <Loader2Icon class="h-10 w-10 animate-spin text-slate-500" />
        </div>
      {:else if $savedTripsQuery.data}
        <Table.Root class="border-b">
          <Table.Header>
            <Table.Row
              class="border-t bg-slate-100 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-900">
              <Table.Head class="w-[5%]" />
              <Table.Head class="w-[20%]">Entry</Table.Head>
              <Table.Head class="w-[10%]" />
              <Table.Head class="w-[5%]" />
              <Table.Head class="w-[20%]">Exit</Table.Head>
              <Table.Head class="w-[10%]" />
              <Table.Head class="w-[10%]">Class</Table.Head>
              <Table.Head class="w-[10%]">RFID</Table.Head>
              <Table.Head class="w-[10%] text-right">Fee</Table.Head>
              <Table.Head class="w-[5%]" />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each $savedTripsQuery.data as trip}
              <SavedTripRow {trip} {points} {tollMatrix} {connections} />
            {/each}

            <Table.Row
              class="text-foreground border-b border-t bg-slate-100 font-bold hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-900">
              <Table.Cell />
              <Table.Cell class="py-3">Total</Table.Cell>
              <Table.Cell />
              <Table.Cell />
              <Table.Cell />
              <Table.Cell />
              <Table.Cell />
              <Table.Cell />
              <Table.Cell class="h-10 py-3 text-right">
                {formatNumber(totalFees ?? 0)}
              </Table.Cell>
              <Table.Cell />
            </Table.Row>
          </Table.Body>
        </Table.Root>
      {/if}
    </div>
  </div>
</main>
