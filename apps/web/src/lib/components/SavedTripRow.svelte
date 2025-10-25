<script lang="ts">
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import * as Table from '$lib/components/ui/table';
  import Button from '$lib/components/ui/button/button.svelte';
  import { EllipsisVerticalIcon } from 'lucide-svelte';
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

  const { tollFee, easyTripTotal, autoSweepTotal } = calculate(
    points.find((p) => p.id === trip.pointOriginId) ?? null,
    points.find((p) => p.id === trip.pointDestinationId) ?? null,
    trip.vehicleClass,
    points,
    tollMatrix,
    connections
  );
</script>

<Table.Row class="hover:bg-background">
  <Table.Cell class="py-3">
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="ghost" size="icon"><EllipsisVerticalIcon class="h-5 w-5" /></Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>Move Up</DropdownMenu.Item>
        <DropdownMenu.Item>Move Down</DropdownMenu.Item>
        <DropdownMenu.Item
          class="text-red-500 hover:text-red-500 data-[highlighted]:bg-red-500/10 data-[highlighted]:text-red-500"
          on:click={() => {
            $deleteSavedTrip.mutate(trip.id);
          }}>Delete</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Table.Cell>
  <Table.Cell>
    {points.find((p) => p.id === trip.pointOriginId)?.name}
  </Table.Cell>
  <Table.Cell>
    {points.find((p) => p.id === trip.pointDestinationId)?.name}
  </Table.Cell>
  <Table.Cell>
    Class {trip.vehicleClass}
  </Table.Cell>
  <Table.Cell class="text-right">
    {formatNumber(tollFee)}
  </Table.Cell>
</Table.Row>
