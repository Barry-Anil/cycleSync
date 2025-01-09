CREATE TABLE "account" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "body_changes" (
	"id" text PRIMARY KEY NOT NULL,
	"cycle_entry_id" text,
	"skin_condition" text,
	"hair_condition" text,
	"gut_health" text,
	"diet_cravings" text
);
--> statement-breakpoint
CREATE TABLE "bowel_movements" (
	"id" text PRIMARY KEY NOT NULL,
	"cycle_entry_id" text,
	"frequency" integer,
	"consistency" text
);
--> statement-breakpoint
CREATE TABLE "cognitive_assessments" (
	"id" text PRIMARY KEY NOT NULL,
	"cycle_entry_id" text,
	"focus" text,
	"memory" text
);
--> statement-breakpoint
CREATE TABLE "cycle_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"date" date NOT NULL,
	"end_date" timestamp NOT NULL,
	"mood" text,
	"energy" integer,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "medications" (
	"id" text PRIMARY KEY NOT NULL,
	"cycle_entry_id" text,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"sessionToken" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "session_sessionToken_unique" UNIQUE("sessionToken")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" varchar(255),
	"emailVerified" timestamp,
	"image" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "body_changes" ADD CONSTRAINT "body_changes_cycle_entry_id_cycle_entries_id_fk" FOREIGN KEY ("cycle_entry_id") REFERENCES "public"."cycle_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bowel_movements" ADD CONSTRAINT "bowel_movements_cycle_entry_id_cycle_entries_id_fk" FOREIGN KEY ("cycle_entry_id") REFERENCES "public"."cycle_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cognitive_assessments" ADD CONSTRAINT "cognitive_assessments_cycle_entry_id_cycle_entries_id_fk" FOREIGN KEY ("cycle_entry_id") REFERENCES "public"."cycle_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cycle_entries" ADD CONSTRAINT "cycle_entries_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medications" ADD CONSTRAINT "medications_cycle_entry_id_cycle_entries_id_fk" FOREIGN KEY ("cycle_entry_id") REFERENCES "public"."cycle_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;