import type { Action, Point, TollFeeMatrix } from './types';
import { expressways, points, tollFeeMatrix } from './stores';
import { get } from 'svelte/store';
import type { Expressway } from './data/schema';

let allPoints: Point[] = [];
let allExpressways: Expressway[] = [];
let tollMatrix: TollFeeMatrix[] = [];

function calculateToll(tollDeterminants: TollDeterminant) {
  let determinantList = [tollDeterminants.entry, tollDeterminants.exit];

  if (tollDeterminants.entry !== 99999 && tollDeterminants.exit !== 99999) {
    determinantList = determinantList.sort();
  }

  const determinants = determinantList.join(',');

  for (const t of tollMatrix) {
    if (t.determinants === determinants) {
      return t.fee;
    }
  }

  return null;
}

function getExpressway(id: string) {
  return allExpressways.find((e) => e.id === id);
}

function dfs(point: Point, destination: Point, path: Point[]): Point | null {
  if (point.id === destination.id) {
    return point;
  }

  path.push(point);

  const nextIds = [...point.nextNorthIds, ...point.nextSouthIds];

  for (const nextId of nextIds) {
    if (
      !path
        .map((p) => {
          return p.id;
        })
        .includes(nextId)
    ) {
      const nextPoint = allPoints.find((p) => {
        return p.id === nextId;
      }) as Point;

      const result = dfs(nextPoint, destination, path);
      if (result) {
        return result;
      }
    }
  }

  path.pop();
  return null;
}

type TollDeterminant = {
  entry: number;
  exit: number;
};

export function generateActions(originPoint: Point, destinationPoint: Point) {
  allPoints = get(points);
  allExpressways = get(expressways);
  tollMatrix = get(tollFeeMatrix);

  const path: Point[] = [];

  dfs(originPoint, destinationPoint, path);

  path.push(destinationPoint);

  const actions: Action[] = [];
  let tollDeterminants: TollDeterminant = {
    entry: 99999,
    exit: 99999
  };
  let tollFee: number | null = null;

  path.forEach((p, index) => {
    let action: '' | 'ENTER' | 'EXIT' | 'PAY' = '';
    let enPassant = false;

    if (p.descriptor === 'ENTRANCE_RAMP') {
      action = 'ENTER';
    } else if (p.descriptor === 'EXIT_RAMP') {
      action = 'EXIT';
    } else if (p.descriptor === 'TOLL_GATE') {
      if (index === 0) {
        tollDeterminants.entry = p.id;
      } else if (index !== path.length - 1) {
        if (path[index + 1].descriptor === 'EXIT_RAMP') {
          tollDeterminants.exit = p.id;
        } else if (
          getExpressway(p.expresswayId as string)?.tollNetworkId !==
          getExpressway(path[index + 1].expresswayId as string)?.tollNetworkId
        ) {
          tollDeterminants.exit = p.id;
        } else {
          enPassant = true;
        }
      } else if (index === path.length - 1) {
        tollDeterminants.exit = p.id;
      }

      tollFee = calculateToll(tollDeterminants);

      if (tollFee !== null) {
        action = 'PAY';
        tollDeterminants = { entry: 99999, exit: 99999 };
      } else if (!enPassant) {
        action = 'ENTER';
      }
    }

    if (action) {
      if (tollFee) {
        actions.push({
          action,
          amount: tollFee,
          point: p
        });
        tollFee = null;
      } else {
        actions.push({
          action,
          point: p
        });
      }
    }
  });

  return actions;
}

function dfs2(point: Point, path: Point[], direction: 'NORTH' | 'SOUTH'): Point | null {
  path.push(point);

  const nextIds = direction === 'NORTH' ? [...point.nextNorthIds] : [...point.nextSouthIds];

  for (const nextId of nextIds) {
    if (
      !path
        .map((p) => {
          return p.id;
        })
        .includes(nextId)
    ) {
      const nextPoint = allPoints.find((p) => p.id === nextId) as Point;

      const result = dfs2(nextPoint, path, direction);
      if (result) {
        return result;
      }
    }
  }

  return null;
}

export function getReachables(originPoint: Point) {
  allPoints = get(points);
  allExpressways = get(expressways);
  tollMatrix = get(tollFeeMatrix);

  const northPath: Point[] = [];
  dfs2(originPoint, northPath, 'NORTH');

  const southPath: Point[] = [];
  dfs2(originPoint, southPath, 'SOUTH');

  return [
    ...northPath.filter((p) => p.id !== originPoint.id),
    ...southPath.filter((p) => p.id !== originPoint.id)
  ];
}
