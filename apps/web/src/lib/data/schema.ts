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

export const rfidEnum = pgEnum('rfid', ['EASYTRIP', 'AUTOSWEEP']);

export const tollNetwork = pgTable('toll_network', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 500 }),
  rfid: rfidEnum('rfid'),
});

export const expressway = pgTable('expressway', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 500 }),
  tollNetworkId: varchar('toll_network_id', { length: 50 }).references(() => tollNetwork.id),
  sequence: integer('sequence').default(1),
});

export const point = pgTable('point', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 500 }),
  expresswayId: varchar('expresway_id', { length: 50 }).references(() => expressway.id),
  sequence: integer('sequence'),
});

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
    reversible: boolean('reversible').notNull(),
  },
  (t) => ({
    compoundKey: primaryKey({ columns: [t.entryPointId, t.exitPointId] }),
  })
);

export const connection = pgTable(
  'connection',
  {
    pointId: integer('point_id').references(() => point.id),
    connectingPointId: integer('connecting_point_id').references(() => point.id),
  },
  (t) => ({
    compoundKey: primaryKey({ columns: [t.pointId, t.connectingPointId] }),
  })
);

export type Expressway = InferSelectModel<typeof expressway>;
export type Point = InferSelectModel<typeof point> & { tollNetworkId?: string | null } & {
  expresswaySequence?: number | null;
} & { expresswayId?: string | null };
export type TollMatrix = InferSelectModel<typeof tollMatrix>;
export type TollNetwork = InferSelectModel<typeof tollNetwork>;
