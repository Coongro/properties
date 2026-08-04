ALTER TABLE "module_properties_buildings" ADD COLUMN "photos" jsonb;--> statement-breakpoint
ALTER TABLE "module_properties_units" ADD COLUMN "photos" jsonb;--> statement-breakpoint
UPDATE "module_properties_buildings" SET "photos" = jsonb_build_array(jsonb_build_object('url', "photo_url")) WHERE "photo_url" IS NOT NULL AND btrim("photo_url") <> '';--> statement-breakpoint
UPDATE "module_properties_units" SET "photos" = jsonb_build_array(jsonb_build_object('url', "photo_url")) WHERE "photo_url" IS NOT NULL AND btrim("photo_url") <> '';--> statement-breakpoint
ALTER TABLE "module_properties_buildings" DROP COLUMN "photo_url";--> statement-breakpoint
ALTER TABLE "module_properties_units" DROP COLUMN "photo_url";
