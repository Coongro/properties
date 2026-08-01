CREATE TABLE "module_properties_building_expenses" (
	"id" uuid PRIMARY KEY NOT NULL,
	"building_id" uuid NOT NULL,
	"period" text NOT NULL,
	"amount" numeric NOT NULL,
	"status" text NOT NULL,
	"sent_at" text,
	"paid_at" text,
	"document_url" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "module_properties_buildings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"street" text,
	"street_number" text,
	"city" text,
	"province" text,
	"zip_code" text,
	"cadastral_ref" text,
	"ownership_mode" text,
	"year_built" integer,
	"admin_name" text,
	"admin_phone" text,
	"admin_email" text,
	"photo_url" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "module_properties_certificates" (
	"id" uuid PRIMARY KEY NOT NULL,
	"building_id" uuid,
	"unit_id" uuid,
	"type" text NOT NULL,
	"done_at" text,
	"expires_at" text NOT NULL,
	"result" text,
	"file_url" text,
	"alert_days" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "module_properties_unit_owners" (
	"id" uuid PRIMARY KEY NOT NULL,
	"unit_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"share_pct" numeric,
	"role" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "module_properties_units" (
	"id" uuid PRIMARY KEY NOT NULL,
	"building_id" uuid NOT NULL,
	"name" text NOT NULL,
	"rooms" integer,
	"bathrooms" integer,
	"surface_m2" numeric,
	"share_pct" numeric,
	"status" text NOT NULL,
	"reference_rent" numeric,
	"photo_url" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "idx_properties_certificates_expires" ON "module_properties_certificates" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_properties_certificates_building" ON "module_properties_certificates" USING btree ("building_id");--> statement-breakpoint
CREATE INDEX "idx_properties_certificates_unit" ON "module_properties_certificates" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "idx_properties_units_building" ON "module_properties_units" USING btree ("building_id");--> statement-breakpoint
CREATE INDEX "idx_properties_units_status" ON "module_properties_units" USING btree ("status");