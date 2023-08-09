import type { InferModel } from 'drizzle-orm';
import { boolean, int, mysqlEnum, mysqlTable, primaryKey, varchar } from 'drizzle-orm/mysql-core';

export const expressway = mysqlTable('expressway', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 500 })
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

export type Expressway = InferModel<typeof expressway, 'select'>;
export type Point = InferModel<typeof point, 'select'>;
export type Link = InferModel<typeof link, 'select'>;
