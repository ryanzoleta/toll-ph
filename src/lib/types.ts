import type { Point as OriginalPoint, Expressway as OriginalExpressway } from './data/schema';

export type Action = {
  action: string;
  point: Point;
  amount?: number;
};

export type Point = OriginalPoint & {
  nextNorthIds: number[];
  nextSouthIds: number[];
  nextNorths?: OriginalPoint[];
  nextSouths?: OriginalPoint[];
};

export type TollFeeMatrix = {
  determinants: string;
  fee: number;
};

export type Expressway = OriginalExpressway & {
  rfid: string | null;
};
