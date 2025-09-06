/*
  Warnings:

  - You are about to drop the column `file_name` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `file_path` on the `attachments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "attachments" DROP COLUMN "file_name",
DROP COLUMN "file_path";
