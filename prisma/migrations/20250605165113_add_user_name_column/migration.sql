/*
  Warnings:

  - A unique constraint covering the columns `[user_name]` on the table `artisans_profile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_name` to the `artisans_profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "artisans_profile" ADD COLUMN     "user_name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "artisans_profile_user_name_key" ON "artisans_profile"("user_name");
