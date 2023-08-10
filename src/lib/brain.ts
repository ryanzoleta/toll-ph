import type { index } from 'drizzle-orm/mysql-core';
import type { Point as OriginalPoint } from './data/schema';
import type { Action, Point } from './types';

let globalAllPoints: Point[] = [];

function checkIfMustPay(tollDeterminants: Point[]) {
  return true;
}

function dfs(point: Point, destination: Point, path: Point[]): Point | null {
  console.log('Traversing point', point.name);

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
      const nextPoint = globalAllPoints.find((p) => {
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

export function generateActions(originPoint: Point, destinationPoint: Point, allPoints: Point[]) {
  globalAllPoints = allPoints;
  const path: Point[] = [];

  const result = dfs(originPoint, destinationPoint, path);

  path.push(destinationPoint);

  console.log(path);
  console.log(result?.name);

  const actions: Action[] = [];
  const tollDeterminants: Point[] = [];

  path.forEach((p, index) => {
    let action: 'ENTER' | 'EXIT' | 'PAY' = 'ENTER';
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
        }
      } else if (index === path.length) {
        tollDeterminants.push(p);
      }

      if (checkIfMustPay(tollDeterminants)) {
        action = 'PAY';
      }
    }

    actions.push({
      action,
      point: p
    });
  });

  return actions;
}
