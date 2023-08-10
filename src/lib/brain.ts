import type { Action, Point } from './types';
import { expressways, points } from './stores';
import { get } from 'svelte/store';
import type { Expressway } from './data/schema';

let allPoints: Point[] = [];
let allExpressways: Expressway[] = [];

const MOCK_TOLL_MATRIX = [
  {
    determinants: '1,5',
    fee: 84
  },
  {
    determinants: '4,5',
    fee: 34
  }
];

function checkIfMustPay(tollDeterminants: Point[]) {
  const determinants = tollDeterminants
    .map((p) => {
      return p.id;
    })
    .sort()
    .join(',');

  console.log(determinants);

  for (const t of MOCK_TOLL_MATRIX) {
    if (t.determinants === determinants) {
      return true;
    }
  }

  return false;
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

export function generateActions(originPoint: Point, destinationPoint: Point) {
  allPoints = get(points);
  allExpressways = get(expressways);

  const path: Point[] = [];

  const result = dfs(originPoint, destinationPoint, path);

  path.push(destinationPoint);

  console.log(result?.name);

  const actions: Action[] = [];
  let tollDeterminants: Point[] = [];

  path.forEach((p, index) => {
    let action: '' | 'ENTER' | 'EXIT' | 'PAY' = '';
    let enPassant = false;

    if (p.descriptor === 'ENTRANCE_RAMP') {
      action = 'ENTER';
    } else if (p.descriptor === 'EXIT_RAMP') {
      action = 'EXIT';
    } else if (p.descriptor === 'TOLL_GATE') {
      if (index === 0) {
        tollDeterminants.push(p);
      } else if (index !== path.length - 1) {
        if (path[index + 1].descriptor === 'EXIT_RAMP') {
          tollDeterminants.push(p);
        } else if (
          getExpressway(p.expresswayId as string)?.tollNetworkId !==
          getExpressway(path[index + 1].expresswayId as string)?.tollNetworkId
        ) {
          tollDeterminants.push(p);
        } else {
          enPassant = true;
        }
      } else if (index === path.length - 1) {
        tollDeterminants.push(p);
      }

      if (checkIfMustPay(tollDeterminants)) {
        action = 'PAY';
        tollDeterminants = [];
      } else if (!enPassant) {
        action = 'ENTER';
      }
    }

    if (action) {
      actions.push({
        action,
        point: p
      });
    }
  });

  return actions;
}
