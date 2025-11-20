/*
  Warnings:

  - You are about to alter the column `comment` on the `product_ratings` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.

*/
-- AlterTable
ALTER TABLE "product_ratings" ALTER COLUMN "comment" SET DATA TYPE VARCHAR(500);

-- CreateIndex
CREATE INDEX "idx_product_ratings_product_createdat" ON "product_ratings"("fk_product_id", "created_at");
