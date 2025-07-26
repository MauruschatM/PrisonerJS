ALTER TABLE "tournament" ADD COLUMN "created_by" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE;
