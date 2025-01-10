// db/schema.ts

import { 
  timestamp,
  text,
  integer,
  pgTable,
  uuid,
  primaryKey,
  boolean,
  date, 
  varchar
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const users = pgTable("user", {
  id: text("id").primaryKey().notNull(),
  name: text("name"),
  email: varchar("email", { length: 255 }).unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});


export const accounts = pgTable("account", {
  id: text("id").primaryKey().notNull().default(sql`gen_random_uuid()`),
  userId: text("userId")
    .notNull()
    .references(() => users.id),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = pgTable("session", {
  id: text("id").primaryKey().notNull().default(sql`gen_random_uuid()`), // Added UUID default
  userId: text("userId")
    .notNull()
    .references(() => users.id),
  sessionToken: text("sessionToken").notNull().unique(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verificationToken", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// Main cycle entries table
export const cycleEntries = pgTable("cycle_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  date: date("date").notNull(),
  endDate: date("end_date").notNull(),
  mood: text("mood"),
  energy: integer("energy"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Body changes table
export const bodyChanges = pgTable("body_changes", {
  id: uuid("id").defaultRandom().primaryKey(),
  cycleEntryId: uuid("cycle_entry_id")
    .notNull()
    .references(() => cycleEntries.id, { onDelete: "cascade" }),
  skinCondition: text("skin_condition"),
  hairCondition: text("hair_condition"),
  gutHealth: text("gut_health"),
  dietCravings: text("diet_cravings"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bowel movements table
export const bowelMovements = pgTable("bowel_movements", {
  id: uuid("id").defaultRandom().primaryKey(),
  cycleEntryId: uuid("cycle_entry_id")
    .notNull()
    .references(() => cycleEntries.id, { onDelete: "cascade" }),
  frequency: integer("frequency"),
  consistency: text("consistency"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cognitive assessments table
export const cognitiveAssessments = pgTable("cognitive_assessments", {
  id: uuid("id").defaultRandom().primaryKey(),
  cycleEntryId: uuid("cycle_entry_id")
    .notNull()
    .references(() => cycleEntries.id, { onDelete: "cascade" }),
  focus: text("focus"),
  memory: text("memory"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Medications table
export const medications = pgTable("medications", {
  id: uuid("id").defaultRandom().primaryKey(),
  cycleEntryId: uuid("cycle_entry_id")
    .notNull()
    .references(() => cycleEntries.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define relations
export const cycleEntriesRelations = relations(cycleEntries, ({ many }) => ({
  bodyChanges: many(bodyChanges),
  bowelMovements: many(bowelMovements),
  cognitiveAssessments: many(cognitiveAssessments),
  medications: many(medications),
}));

export const bodyChangesRelations = relations(bodyChanges, ({ one }) => ({
  cycleEntry: one(cycleEntries, {
    fields: [bodyChanges.cycleEntryId],
    references: [cycleEntries.id],
  }),
}));

export const bowelMovementsRelations = relations(bowelMovements, ({ one }) => ({
  cycleEntry: one(cycleEntries, {
    fields: [bowelMovements.cycleEntryId],
    references: [cycleEntries.id],
  }),
}));

export const cognitiveAssessmentsRelations = relations(cognitiveAssessments, ({ one }) => ({
  cycleEntry: one(cycleEntries, {
    fields: [cognitiveAssessments.cycleEntryId],
    references: [cycleEntries.id],
  }),
}));

export const medicationsRelations = relations(medications, ({ one }) => ({
  cycleEntry: one(cycleEntries, {
    fields: [medications.cycleEntryId],
    references: [cycleEntries.id],
  }),
}));