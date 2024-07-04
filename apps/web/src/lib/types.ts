import type { Expressway as OriginalExpressway, Point } from './data/schema';

export type Action = {
  action: string;
  point: Point;
  amount?: number;
};

export type TollFeeMatrix = {
  determinants: string;
  fee: number;
};

export type Expressway = OriginalExpressway & {
  rfid: string | null;
};

export type TollSegment = {
  entryPoint: Point;
  exitPoint: Point;
  fee: number;
};

export type TripResult = {
  totalFee: number;
  tollSegments: TollSegment[];
};
