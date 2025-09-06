-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_fk_artisan_id_fkey";

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_fk_artisan_id_fkey" FOREIGN KEY ("fk_artisan_id") REFERENCES "artisans_profile"("fk_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
