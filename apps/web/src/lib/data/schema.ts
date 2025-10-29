import type { InferSelectModel } from 'drizzle-orm';
import {
  boolean,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const rfidEnum = pgEnum('rfid', ['AUTOSWEEP', 'EASYTRIP']);

export const tollNetwork = pgTable('toll_network', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 500 }),
  rfid: rfidEnum('rfid'),
  sequence: integer('sequence').default(1),
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
    vehicleClass: integer('vehicle_class').notNull(),
  },
  (t) => ({
    compoundKey: primaryKey({ columns: [t.entryPointId, t.exitPointId, t.vehicleClass] }),
  })
);

export const connection = pgTable(
  'connection',
  {
    pointId: integer('point_id')
      .references(() => point.id)
      .notNull(),
    connectingPointId: integer('connecting_point_id')
      .references(() => point.id)
      .notNull(),
  },
  (t) => ({
    compoundKey: primaryKey({ columns: [t.pointId, t.connectingPointId] }),
  })
);

export type Expressway = InferSelectModel<typeof expressway>;
export type Point = InferSelectModel<typeof point> & {
  tollNetworkId?: string | null;
  expresswaySequence?: number | null;
  rfid?: 'EASYTRIP' | 'AUTOSWEEP' | null;
} & { expresswayId?: string | null };
export type TollMatrix = InferSelectModel<typeof tollMatrix>;
export type TollNetwork = InferSelectModel<typeof tollNetwork>;

export type TollMatrixFull = {
  toll_matrix: TollMatrix;
  entryPoint: Point;
  exitPoint: Point;
  entryExpressway: Expressway;
  exitExpressway: Expressway;
};

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const savedTrip = pgTable(
  'saved_trip',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    pointOriginId: integer('point_origin_id')
      .references(() => point.id)
      .notNull(),
    pointDestinationId: integer('point_destination_id')
      .references(() => point.id)
      .notNull(),
    vehicleClass: integer('vehicle_class').notNull(),
    sequence: integer('sequence').default(1).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (t) => ({
    savedTripUserIdIdx: index('saved_trip_user_id_idx').on(t.userId),
  })
);

export type SavedTrip = InferSelectModel<typeof savedTrip>;

export type User = InferSelectModel<typeof user>;
export type Session = InferSelectModel<typeof session>;

// Types for the pro page load function queries
export type PointWithExpresswayAndNetwork = {
  id: number;
  name: string | null;
  expresswayId: string | null;
  expresswaySequence: number | null;
  sequence: number | null;
  tollNetworkId: string | null;
  rfid: 'AUTOSWEEP' | 'EASYTRIP' | null;
};

export type ExpresswayWithNetwork = {
  id: string;
  name: string | null;
  tollNetworkId: string | null;
  rfid: 'AUTOSWEEP' | 'EASYTRIP' | null;
};

export type TollMatrixWithPoints = {
  toll_matrix: TollMatrix;
  entry_point: Point;
  exit_point: Point;
};

export type ConnectionWithPoints = {
  connection: InferSelectModel<typeof connection>;
  point: PointWithExpresswayAndNetwork;
  connecting_point: PointWithExpresswayAndNetwork;
};
