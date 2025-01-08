import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";


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

export const cycleEntries = pgTable("cycle_entries", {
  id: text("id").primaryKey(),  // Changed from serial to text
  userId: text("user_id")       // Changed from integer to text
    .references(() => users.id),
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date").notNull(), 
  mood: text("mood"),
  energy: integer("energy"),
  notes: text("notes"),
});

export const bodyChanges = pgTable("body_changes", {
  id: text("id").primaryKey(),  // Changed from serial to text
  cycleEntryId: text("cycle_entry_id")  // Changed from integer to text
    .references(() => cycleEntries.id),
  skinCondition: text("skin_condition"),
  hairCondition: text("hair_condition"),
  gutHealth: text("gut_health"),
  dietCravings: text("diet_cravings"),
});

export const bowelMovements = pgTable("bowel_movements", {
  id: text("id").primaryKey(),  // Changed from serial to text
  cycleEntryId: text("cycle_entry_id")  // Changed from integer to text
    .references(() => cycleEntries.id),
  frequency: integer("frequency"),
  consistency: text("consistency"),
});

export const cognitiveAssessments = pgTable("cognitive_assessments", {
  id: text("id").primaryKey(),  // Changed from serial to text
  cycleEntryId: text("cycle_entry_id")  // Changed from integer to text
    .references(() => cycleEntries.id),
  focus: text("focus"),
  memory: text("memory"),
});

export const medications = pgTable("medications", {
  id: text("id").primaryKey(),  // Changed from serial to text
  cycleEntryId: text("cycle_entry_id")  // Changed from integer to text
    .references(() => cycleEntries.id),
  name: text("name").notNull(),
});