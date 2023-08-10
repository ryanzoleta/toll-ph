import type { InferModel } from 'drizzle-orm';
import {
  boolean,
  decimal,
  double,
  float,
  int,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  varchar
} from 'drizzle-orm/mysql-core';

export const tollNetwork = mysqlTable('toll_network', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 500 })
});

export const expressway = mysqlTable('expressway', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 500 }),
  tollNetworkId: varchar('toll_network_id', { length: 50 }).references(() => tollNetwork.id)
});

export const point = mysqlTable('point', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 500 }),
  descriptor: mysqlEnum('descriptor', ['ENTRANCE_RAMP', 'EXIT_RAMP', 'TOLL_GATE']),
  expresswayId: varchar('expresway_id', { length: 50 }).references(() => expressway.id),
  entryable: boolean('entryable'),
  exitable: boolean('exitable')
});

export const link = mysqlTable(
  'link',
  {
    originPointId: int('origin_point_id').references(() => point.id),
    nextPointId: int('next_point_id').references(() => point.id),
    direction: mysqlEnum('direction', ['NORTH', 'SOUTH'])
  },
  (t) => ({
    pk: primaryKey(t.originPointId, t.nextPointId, t.direction)
  })
);

export const tollMatrix = mysqlTable(
  'toll_matrix',
  {
    entryPointId: int('entry_point_id').references(() => point.id),
    exitPointId: int('exit_point_id').references(() => point.id),
    fee: decimal('fee', { precision: 10, scale: 2 })
  },
  (t) => ({
    pk: primaryKey(t.entryPointId, t.exitPointId)
  })
);

export type Expressway = InferModel<typeof expressway, 'select'>;
export type Point = InferModel<typeof point, 'select'>;
export type Link = InferModel<typeof link, 'select'>;
export type TollMatrix = InferModel<typeof tollMatrix, 'select'>;
