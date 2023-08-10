import type { Point as OriginalPoint } from './data/schema';
import type { Point } from './types';

let globalAllPoints: Point[] = [];

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
  console.log(path);
  console.log(result?.name);

  return [
    {
      action: 'Enter',
      point: originPoint
    },
    {
      action: 'Pay toll fee at ',
      point: destinationPoint
    }
  ];
}
