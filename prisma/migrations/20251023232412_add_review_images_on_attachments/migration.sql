-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "fk_review_id" TEXT;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_fk_review_id_fkey" FOREIGN KEY ("fk_review_id") REFERENCES "product_ratings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
