-- Add price tracking fields used by wishlist price-update jobs.
-- Existing local databases may have applied an older wishlist migration
-- before these nullable columns were added to the Prisma model.
ALTER TABLE "game"
ADD COLUMN IF NOT EXISTS "priceCents" INTEGER,
ADD COLUMN IF NOT EXISTS "originalPriceCents" INTEGER,
ADD COLUMN IF NOT EXISTS "currency" TEXT,
ADD COLUMN IF NOT EXISTS "store" TEXT;
