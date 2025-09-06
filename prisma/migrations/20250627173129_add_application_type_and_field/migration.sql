-- CreateEnum
CREATE TYPE "ApplicationType" AS ENUM ('BE_ARTISAN', 'DISABLE_PROFILE');

-- AlterTable
ALTER TABLE "artisan_applications" ADD COLUMN     "type" "ApplicationType" NOT NULL DEFAULT 'BE_ARTISAN';
