<script lang="ts">
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import * as Table from '$lib/components/ui/table';
  import Button from '$lib/components/ui/button/button.svelte';
  import {
    ArrowRightIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    EllipsisVerticalIcon,
  } from 'lucide-svelte';
  import { formatNumber } from '$lib/utils';
  import type {
    ConnectionWithPoints,
    Point,
    PointWithExpresswayAndNetwork,
    SavedTrip,
    TollMatrixWithPoints,
  } from '$lib/data/schema';
  import { createMutation, useQueryClient } from '@tanstack/svelte-query';
  import { calculate } from '$lib/calculate';
  import type { TollSegment } from '$lib/types';
  import EasyTrip from './ui/EasyTrip.svelte';
  import AutoSweep from './ui/AutoSweep.svelte';

  export let trip: SavedTrip;
  export let points: PointWithExpresswayAndNetwork[];
  export let tollMatrix: TollMatrixWithPoints[];
  export let connections: ConnectionWithPoints[];

  const queryClient = useQueryClient();

  const deleteSavedTrip = createMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/saved/${id}`, {
        method: 'DELETE',
      });
      return response.json();
    },
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['savedTrips'] });
      const previousTransactions = queryClient.getQueryData<SavedTrip[]>(['savedTrips']);
      queryClient.setQueryData<SavedTrip[]>(['savedTrips'], (old) => {
        return old?.filter((t) => t.id !== id) ?? [];
      });
      return { previousTransactions };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['savedTrips'] });
    },
  });

  let tollFee = 0;
  let easyTripTotal = 0;
  let autoSweepTotal = 0;
  let tollSegments: TollSegment[] = [];

  const result = calculate(
    points.find((p) => p.id === trip.pointOriginId) ?? null,
    points.find((p) => p.id === trip.pointDestinationId) ?? null,
    trip.vehicleClass,
    points,
    tollMatrix,
    connections
  );

  $: tollFee = result.tollFee;
  $: easyTripTotal = result.easyTripTotal;
  $: autoSweepTotal = result.autoSweepTotal;
  $: tollSegments = result.tollSegments ?? [];

  let showSegments = false;

  const moveUpSavedTrip = createMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/saved/${id}/moveup`, {
        method: 'POST',
      });
      return response.json();
    },
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['savedTrips'] });
      const previousTransactions = queryClient.getQueryData<SavedTrip[]>(['savedTrips']);
      queryClient.setQueryData<SavedTrip[]>(['savedTrips'], (old) => {
        const tripToMoveUp = old?.find((t) => t.id === id);
        return (
          (old?.map((t) =>
            t.id === id
              ? { ...t, sequence: t.sequence - 1 }
              : t.sequence === (tripToMoveUp?.sequence ?? 0) - 1
              ? { ...t, sequence: t.sequence + 1 }
              : t
          ) as SavedTrip[]) ?? []
        ).sort((a, b) => a.sequence - b.sequence);
      });
      return { previousTransactions };
    },
  });

  const moveDownSavedTrip = createMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/saved/${id}/movedown`, {
        method: 'POST',
      });
      return response.json();
    },
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['savedTrips'] });
      const previousTransactions = queryClient.getQueryData<SavedTrip[]>(['savedTrips']);
      queryClient.setQueryData<SavedTrip[]>(['savedTrips'], (old) => {
        const tripToMoveDown = old?.find((t) => t.id === id);
        return (
          (old?.map((t) =>
            t.id === id
              ? { ...t, sequence: t.sequence + 1 }
              : t.sequence === (tripToMoveDown?.sequence ?? 0) + 1
              ? { ...t, sequence: t.sequence - 1 }
              : t
          ) as SavedTrip[]) ?? []
        ).sort((a, b) => a.sequence - b.sequence);
      });
      return { previousTransactions };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['savedTrips'] });
    },
  });
</script>

<Table.Row class="hover:bg-background">
  <Table.Cell class="py-3">
    <Button
      variant="ghost"
      size="icon"
      on:click={() => {
        showSegments = !showSegments;
      }}>
      {#if showSegments}
        <ChevronDownIcon class="h-5 w-5" />
      {:else}
        <ChevronRightIcon class="h-5 w-5" />
      {/if}
    </Button>
  </Table.Cell>
  <Table.Cell>
    {points.find((p) => p.id === trip.pointOriginId)?.name}
  </Table.Cell>
  <Table.Cell class="text-slate-400 dark:text-slate-600">
    {points.find((p) => p.id === trip.pointOriginId)?.expresswayId}
  </Table.Cell>
  <Table.Cell>
    <ArrowRightIcon class="h-5 w-5 text-slate-400 dark:text-slate-600" />
  </Table.Cell>
  <Table.Cell>
    {points.find((p) => p.id === trip.pointDestinationId)?.name}
  </Table.Cell>
  <Table.Cell class="text-slate-400 dark:text-slate-600">
    {points.find((p) => p.id === trip.pointDestinationId)?.expresswayId}
  </Table.Cell>
  <Table.Cell>
    <div class="flex flex-row items-center gap-1">
      {#if trip.vehicleClass === 1}
        <div
          class="rounded-lg bg-teal-300 px-2 py-1 text-center font-mono text-xs text-teal-700 dark:bg-teal-900 dark:text-teal-400">
          <p>1</p>
        </div>
      {:else if trip.vehicleClass === 2}
        <div
          class="rounded-lg bg-rose-300 px-2 py-1 font-mono text-xs text-rose-700 dark:bg-rose-900 dark:text-rose-400">
          2
        </div>
      {:else if trip.vehicleClass === 3}
        <div
          class="rounded-lg bg-purple-300 px-2 py-1 font-mono text-xs text-purple-700 dark:bg-purple-900 dark:text-purple-400">
          3
        </div>
      {/if}
    </div>
  </Table.Cell>
  <Table.Cell>
    <div class="flex flex-row items-center gap-1">
      {#if tollSegments.some((s) => s.exitPoint.rfid === 'AUTOSWEEP') && !tollSegments.some((s) => s.exitPoint.rfid === 'EASYTRIP')}
        <AutoSweep />
      {:else if tollSegments.some((s) => s.exitPoint.rfid === 'EASYTRIP') && !tollSegments.some((s) => s.exitPoint.rfid === 'AUTOSWEEP')}
        <EasyTrip />
      {:else}
        <div
          class="rounded-lg bg-yellow-300 px-2 py-1 font-mono text-xs text-yellow-700 dark:bg-yellow-900 dark:text-yellow-400">
          <p>Both</p>
        </div>
      {/if}
    </div>
  </Table.Cell>
  <Table.Cell class="text-right">
    {formatNumber(tollFee)}
  </Table.Cell>

  <Table.Cell class="text-right">
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="ghost" size="icon"><EllipsisVerticalIcon class="h-5 w-5" /></Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item
          on:click={() => {
            showSegments = false;
            $moveUpSavedTrip.mutate(trip.id);
          }}>Move Up</DropdownMenu.Item>
        <DropdownMenu.Item
          on:click={() => {
            showSegments = false;
            $moveDownSavedTrip.mutate(trip.id);
          }}>Move Down</DropdownMenu.Item>
        <DropdownMenu.Item
          class="text-red-500 hover:text-red-500 data-[highlighted]:bg-red-500/10 data-[highlighted]:text-red-500"
          on:click={() => {
            showSegments = false;
            $deleteSavedTrip.mutate(trip.id);
          }}>Delete</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Table.Cell>
</Table.Row>

{#if showSegments}
  {#each tollSegments as segment}
    <Table.Row
      class="border-t-0 bg-slate-100 hover:bg-slate-100 dark:border-b-slate-800 dark:bg-slate-900 dark:hover:bg-slate-900">
      <Table.Cell class="py-3" />
      <Table.Cell class="text-slate-400 dark:text-slate-600">
        {points.find((p) => p.id === segment.entryPoint.id)?.name}
      </Table.Cell>
      <Table.Cell class="text-slate-400 dark:text-slate-600">
        {points.find((p) => p.id === segment.entryPoint.id)?.expresswayId}
      </Table.Cell>
      <Table.Cell>
        <ArrowRightIcon class="h-5 w-5 text-slate-400 dark:text-slate-600" />
      </Table.Cell>
      <Table.Cell class="text-slate-400 dark:text-slate-600">
        {points.find((p) => p.id === segment.exitPoint.id)?.name}
      </Table.Cell>
      <Table.Cell class="text-slate-400 dark:text-slate-600">
        {points.find((p) => p.id === segment.exitPoint.id)?.expresswayId}
      </Table.Cell>
      <Table.Cell />
      <Table.Cell>
        <div class="flex flex-row items-center gap-1">
          {#if segment.entryPoint.rfid === 'AUTOSWEEP'}
            <AutoSweep />
          {:else}
            <EasyTrip />
          {/if}
        </div>
      </Table.Cell>
      <Table.Cell class="h-10 text-right">
        {formatNumber(segment.fee)}
      </Table.Cell>
      <Table.Cell />
    </Table.Row>
  {/each}
{/if}
