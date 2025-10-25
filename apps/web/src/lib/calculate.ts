import PointSelector from '$lib/components/ui/PointSelector.svelte';
import Trip from '$lib/components/ui/Trip.svelte';
import { formatAmountToCurrency, formatNumber } from '$lib/utils.js';
import Button from '$lib/components/ui/button/button.svelte';
import Header from '$lib/components/ui/Header.svelte';
import type {
  ConnectionWithPoints,
  Point,
  PointWithExpresswayAndNetwork,
  SavedTrip,
  TollMatrixWithPoints,
} from '$lib/data/schema.js';
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
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import { EllipsisVerticalIcon } from 'lucide-svelte';
import * as Table from '$lib/components/ui/table';
import SavedTripRow from '$lib/components/SavedTripRow.svelte';

function queryTollMatrix(
  origin: Point,
  destination: Point,
  vehicleClass: number,
  tollMatrix: TollMatrixWithPoints[]
) {
  let matrix = tollMatrix.find(
    (tm) =>
      tm.entry_point.id === origin.id &&
      tm.exit_point.id === destination.id &&
      tm.toll_matrix.vehicleClass === vehicleClass
  );

  if (matrix !== null && matrix !== undefined) return parseFloat(matrix?.toll_matrix.fee ?? '0');

  matrix = tollMatrix.find(
    (tm) =>
      tm.entry_point.id === destination.id &&
      tm.exit_point.id === origin.id &&
      tm.toll_matrix.reversible &&
      tm.toll_matrix.vehicleClass === vehicleClass
  );
  return parseFloat(matrix?.toll_matrix.fee ?? '0');
}

function getExternalConnections(reachablePointIds: number[], connections: ConnectionWithPoints[]) {
  const conn = connections
    .filter((c) => reachablePointIds.includes(c.point.id))
    .map((c) => ({
      reachableConnectedPoint: c.point,
      externalConnectedPoint: c.connecting_point,
    }));

  const connReversed = connections
    .filter((c) => reachablePointIds.includes(c.connecting_point.id))
    .map((c) => ({
      reachableConnectedPoint: c.connecting_point,
      externalConnectedPoint: c.point,
    }));

  return [...conn, ...connReversed];
}

function getReachables(pointId: number, tollMatrix: TollMatrixWithPoints[], points: Point[]) {
  const returnValue = [
    ...tollMatrix.filter((tm) => tm.entry_point.id === pointId).map((tm) => tm.exit_point),
    ...tollMatrix
      .filter((tm) => tm.exit_point.id === pointId && tm.toll_matrix.reversible)
      .map((tm) => tm.entry_point),
  ];

  // this is crazy, but this is needed to allow southbound connections to NAIAX (e.g., Skyway Buendia to NAIAX)
  if (pointId === 1) {
    const point1 = points.find((p) => p.id === 1);
    if (point1) {
      returnValue.push(point1);
    }
  }

  return returnValue;
}

export function calculate(
  pointOrigin: Point | null,
  pointDestination: Point | null,
  vehicleClass: number,
  points: PointWithExpresswayAndNetwork[],
  tollMatrix: TollMatrixWithPoints[],
  connections: ConnectionWithPoints[]
) {
  console.log('calculate start');
  if (!pointOrigin || !pointDestination) return { tollFee: 0, easyTripTotal: 0, autoSweepTotal: 0 };
  console.log('calculate not returned');

  let originReachables = getReachables(pointOrigin?.id ?? 0, tollMatrix, points);
  let originReachablesPointIds = originReachables.map((c) => c.id);

  let externalConnections: ReturnType<typeof getExternalConnections> = [];
  let externalReachables: Point[] = [];

  externalConnections = getExternalConnections(originReachablesPointIds, connections);
  let tempExternalConnections = [...externalConnections];

  while (tempExternalConnections.length > 0) {
    const l = [...tempExternalConnections];
    tempExternalConnections = [];
    for (const conn of [...l]) {
      const connReachables = getReachables(conn.externalConnectedPoint.id, tollMatrix, points);
      const connReachableIds = connReachables.map((c) => c.id);

      const connExternalConnections = getExternalConnections(connReachableIds, connections).filter(
        (c) => {
          return !externalConnections.some(
            (ec) => ec.externalConnectedPoint.id === c.externalConnectedPoint.id
          );
        }
      );
      externalConnections = [...externalConnections, ...connExternalConnections];
      tempExternalConnections = [...tempExternalConnections, ...connExternalConnections];
    }
  }

  externalReachables = externalConnections
    .map((c) => getReachables(c.externalConnectedPoint.id, tollMatrix, points))
    .reduce((acc, val) => acc.concat(val), []);

  let reachables = [...originReachables, ...externalReachables]
    .map((c) => points.find((p) => p.id === c.id) ?? c)
    .reduce((acc, val) => {
      if (!acc.find((p) => p.id === val.id)) acc.push(val);
      return acc;
    }, [] as Point[]);

  let tollSegments: TollSegment[] = [];
  let tollFee = 0;
  let easyTripTotal = 0;
  let autoSweepTotal = 0;
  let savedResult = false;

  if (pointOrigin.tollNetworkId === pointDestination.tollNetworkId) {
    tollSegments = [
      {
        entryPoint: { ...pointOrigin },
        exitPoint: { ...pointDestination },
        fee: queryTollMatrix(pointOrigin, pointDestination, vehicleClass, tollMatrix),
      },
    ];

    tollFee = queryTollMatrix(pointOrigin, pointDestination, vehicleClass, tollMatrix);
  } else {
    let currentDestination = pointDestination;

    for (let i = 0; i < externalConnections.length; i++) {
      const conn = { ...externalConnections[i] };

      if (currentDestination.tollNetworkId === pointOrigin.tollNetworkId) {
        const fee = queryTollMatrix(pointOrigin, currentDestination, vehicleClass, tollMatrix);
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
        const connReachables = getReachables(conn.externalConnectedPoint.id, tollMatrix, points);
        const connReachableIds = connReachables.map((c) => c.id);

        if (connReachableIds.includes(currentDestination.id)) {
          const fee = queryTollMatrix(
            conn.externalConnectedPoint,
            currentDestination,
            vehicleClass,
            tollMatrix
          );
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

  return {
    tollFee,
    easyTripTotal,
    autoSweepTotal,
  };
}
