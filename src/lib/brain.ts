import type { Point } from './data/schema';

export function generateActions(orinPoint: Point, destinationPoint: Point) {
  return [
    {
      action: 'Enter',
      point: orinPoint
    },
    {
      action: 'Pay toll fee at ',
      point: destinationPoint
    }
  ];
}
