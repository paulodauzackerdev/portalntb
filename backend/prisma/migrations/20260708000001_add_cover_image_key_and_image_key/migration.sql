-- Add coverImageKey to News
ALTER TABLE "news" ADD COLUMN IF NOT EXISTS "cover_image_key" TEXT;

-- Add key column to Image (nullable first, then populate, then make NOT NULL)
ALTER TABLE "images" ADD COLUMN IF NOT EXISTS "key" TEXT;

-- Populate key from url for existing images
UPDATE "images" SET "key" = "url" WHERE "key" IS NULL;

-- Now make key NOT NULL and unique
ALTER TABLE "images" ALTER COLUMN "key" SET NOT NULL;
ALTER TABLE "images" ADD CONSTRAINT "images_key_key" UNIQUE ("key");
