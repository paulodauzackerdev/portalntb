-- Create banner_clicks table
-- Migrate existing click counts into summary records
-- Drop clicks column from banners

-- Create the new table
CREATE TABLE "banner_clicks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "banner_id" UUID NOT NULL,
    "ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banner_clicks_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "banner_clicks_banner_id_fkey" FOREIGN KEY ("banner_id") REFERENCES "banners"("id") ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX "banner_clicks_banner_id_created_at_idx" ON "banner_clicks"("banner_id", "created_at");
CREATE INDEX "banner_clicks_banner_id_ip_created_at_idx" ON "banner_clicks"("banner_id", "ip", "created_at");

-- Migrate existing click counts: banners with clicks > 0 get one record per click
INSERT INTO "banner_clicks" ("id", "banner_id", "ip", "created_at")
SELECT
    gen_random_uuid(),
    b."id",
    NULL,
    b."created_at"
FROM "banners" b
CROSS JOIN LATERAL generate_series(1, b."clicks")
WHERE b."clicks" > 0;

-- Drop the old clicks column
ALTER TABLE "banners" DROP COLUMN "clicks";
