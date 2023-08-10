import type { Point as OriginalPoint } from './data/schema';

export type Action = {
  action: string;
  point: Point;
};

export type Point = OriginalPoint & { nextNorthIds: number[]; nextSouthIds: number[] };