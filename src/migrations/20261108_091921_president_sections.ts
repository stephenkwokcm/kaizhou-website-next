import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "titular_presidents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"title" varchar,
  	"order" numeric DEFAULT 100,
  	"is_current" boolean DEFAULT true,
  	"photo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "titular_presidents_id" integer;
  ALTER TABLE "titular_presidents" ADD CONSTRAINT "titular_presidents_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "titular_presidents_photo_idx" ON "titular_presidents" USING btree ("photo_id");
  CREATE INDEX "titular_presidents_updated_at_idx" ON "titular_presidents" USING btree ("updated_at");
  CREATE INDEX "titular_presidents_created_at_idx" ON "titular_presidents" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_titular_presidents_fk" FOREIGN KEY ("titular_presidents_id") REFERENCES "public"."titular_presidents"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_titular_presidents_id_idx" ON "payload_locked_documents_rels" USING btree ("titular_presidents_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  const { rows } = await db.execute(sql`SELECT 1 FROM "titular_presidents" LIMIT 1`);
  if (rows.length) throw new Error('Refusing to drop president records. Restore the pre-migration backup for rollback.');
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_titular_presidents_fk";
    DROP INDEX "payload_locked_documents_rels_titular_presidents_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "titular_presidents_id";
    DROP TABLE "titular_presidents";
  `);
}
