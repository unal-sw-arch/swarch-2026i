-- CreateTable
CREATE TABLE "wishlist" (
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "game" (
    "id" TEXT NOT NULL,
    "wishlistId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "gameName" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "game_wishlistId_idx" ON "game"("wishlistId");

-- AddForeignKey
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game" ADD CONSTRAINT "game_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "wishlist"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
