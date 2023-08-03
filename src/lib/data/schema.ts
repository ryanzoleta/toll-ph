import {
  bigint,
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  serial,
  unique,
  varchar
} from 'drizzle-orm/mysql-core';

export const expressway = mysqlTable('expressway', {
  id: varchar('id', { length: 100 }).primaryKey(),
  name: varchar('task', { length: 500 })
});

export const point = mysqlTable('point', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('task', { length: 500 }),
  descriptor: varchar('task', { length: 500 }),
  expresswayId: varchar('expresway_id', { length: 100 }).references(() => expressway.id),
  paid: boolean('paid'),
  entryable: boolean('entryable')
});

export const link = mysqlTable(
  'link',
  {
    id: serial('id').primaryKey(),
    originId: int('origin_point_id').references(() => point.id),
    nextId: int('next_point_id').references(() => point.id),
    direction: mysqlEnum('direction', ['north', 'south'])
  },
  (t) => ({
    unq: unique().on(t.originId, t.nextId, t.direction)
  })
);
