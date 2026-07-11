-- CreateTable
CREATE TABLE "banners" (
    "id" UUID NOT NULL,
    "image_key" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "alt" TEXT,
    "link_url" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "portal_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "banners_portal_id_idx" ON "banners"("portal_id");

-- CreateIndex
CREATE INDEX "banners_active_idx" ON "banners"("active");

-- AddForeignKey
ALTER TABLE "banners" ADD CONSTRAINT "banners_portal_id_fkey" FOREIGN KEY ("portal_id") REFERENCES "portals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
