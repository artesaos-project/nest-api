-- CreateTable
CREATE TABLE "artisan_followers" (
    "id" TEXT NOT NULL,
    "fk_follower_id" TEXT NOT NULL,
    "fk_following_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artisan_followers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "artisan_followers_fk_follower_id_fk_following_id_key" ON "artisan_followers"("fk_follower_id", "fk_following_id");

-- AddForeignKey
ALTER TABLE "artisan_followers" ADD CONSTRAINT "artisan_followers_fk_follower_id_fkey" FOREIGN KEY ("fk_follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artisan_followers" ADD CONSTRAINT "artisan_followers_fk_following_id_fkey" FOREIGN KEY ("fk_following_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
