import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  serial,
  unique,
  varchar
} from 'drizzle-orm/mysql-core';

export const expressway = mysqlTable('expressway', {
  id: int('id').primaryKey().autoincrement(),
  abbr: varchar('abbr', { length: 100 }),
  name: varchar('name', { length: 500 })
});

export const point = mysqlTable('point', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 500 }),
  descriptor: varchar('descriptor', { length: 500 }),
  expresswayId: int('expresway_id').references(() => expressway.id),
  paid: boolean('paid'),
  entryable: boolean('entryable')
});

export const link = mysqlTable(
  'link',
  {
    originId: int('origin_point_id').references(() => point.id),
    nextId: int('next_point_id').references(() => point.id),
    direction: mysqlEnum('direction', ['north', 'south'])
  },
  (t) => ({
    pk: primaryKey(t.originId, t.nextId, t.direction)
  })
);
