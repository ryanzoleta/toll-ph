import type { Point as OriginalPoint } from './data/schema';
import type { Point } from './types';

export function generateActions(originPoint: Point, destinationPoint: Point, allPoints: Point[]) {
  const visited: number[] = [];
  const stack: number[] = [];

  let current: Point | undefined = originPoint;

  while (current.id !== destinationPoint.id) {
    if (current.nextNorthIds.length > 0) {
      stack.push(...current.nextNorthIds);
    }

    if (current.nextSouthIds.length > 0) {
      stack.push(...current.nextSouthIds);
    }

    visited.push(current.id);

    const nextId = stack.pop();
    current = allPoints.find((p) => {
      return p.id === nextId;
    });

    if (current === undefined) break;
  }

  console.log(current?.name);

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
