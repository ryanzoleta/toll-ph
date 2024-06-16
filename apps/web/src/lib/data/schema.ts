import type { InferSelectModel } from 'drizzle-orm';
import {
  boolean,
  decimal,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  varchar,
} from 'drizzle-orm/pg-core';

export const rfidEnum = pgEnum('rfid', ['EASY_TRIP', 'AUTOSWEEP']);

export const tollNetwork = pgTable('toll_network', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 500 }),
  rfid: rfidEnum('rfid'),
});

export const expressway = pgTable('expressway', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 500 }),
  tollNetworkId: varchar('toll_network_id', { length: 50 }).references(() => tollNetwork.id),
});

export const descriptorEnum = pgEnum('descriptor', ['ENTRANCE_RAMP', 'EXIT_RAMP', 'TOLL_GATE']);

export const point = pgTable('point', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 500 }),
  descriptor: descriptorEnum('descriptor'),
  expresswayId: varchar('expresway_id', { length: 50 }).references(() => expressway.id),
  entryable: boolean('entryable'),
  exitable: boolean('exitable'),
  sequence: integer('sequence'),
});

export const directionEnum = pgEnum('direction', ['NORTH', 'SOUTH']);

export const link = pgTable(
  'link',
  {
    originPointId: integer('origin_point_id')
      .references(() => point.id)
      .notNull(),
    nextPointId: integer('next_point_id')
      .references(() => point.id)
      .notNull(),
    direction: directionEnum('direction').notNull(),
  },
  (t) => ({
    compoundKey: primaryKey({ columns: [t.originPointId, t.nextPointId, t.direction] }),
  })
);

export const tollMatrix = pgTable(
  'toll_matrix',
  {
    entryPointId: integer('entry_point_id')
      .references(() => point.id)
      .notNull(),
    exitPointId: integer('exit_point_id')
      .references(() => point.id)
      .notNull(),
    fee: decimal('fee', { precision: 10, scale: 2 }),
  },
  (t) => ({
    compoundKey: primaryKey({ columns: [t.entryPointId, t.exitPointId] }),
  })
);

export type Expressway = InferSelectModel<typeof expressway>;
export type Point = InferSelectModel<typeof point>;
export type Link = InferSelectModel<typeof link>;
export type TollMatrix = InferSelectModel<typeof tollMatrix>;
export type TollNetwork = InferSelectModel<typeof tollNetwork>;
