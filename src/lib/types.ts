import type { Point as OriginalPoint } from './data/schema';

export type Action = {
  action: string;
  point: Point;
  amount?: number;
};

export type Point = OriginalPoint & { nextNorthIds: number[]; nextSouthIds: number[] };

export type TollFeeMatrix = {
  determinants: string;
  fee: number;
};
