-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ARTISAN', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role"[],
    "is_disabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_profile" (
    "id" TEXT NOT NULL,
    "fk_user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "social_name" TEXT,
    "cpf" TEXT NOT NULL,
    "dt_birth" TIMESTAMP(3) NOT NULL,
    "street" TEXT,
    "postal_code" TEXT,
    "city" TEXT,
    "number" TEXT,
    "phone" TEXT,
    "avatar" TEXT,

    CONSTRAINT "users_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artisans_profile" (
    "id" TEXT NOT NULL,
    "fk_user_id" TEXT NOT NULL,
    "raw_material" TEXT NOT NULL,
    "technique" TEXT NOT NULL,
    "finality_classification" TEXT NOT NULL,
    "sicab" TEXT NOT NULL,
    "sicab_registration_date" TIMESTAMP(3) NOT NULL,
    "sicab_valid_until" TIMESTAMP(3) NOT NULL,
    "is_disabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "artisans_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artisan_applications" (
    "id" TEXT NOT NULL,
    "fk_user_id" TEXT NOT NULL,
    "raw_material" TEXT NOT NULL,
    "technique" TEXT NOT NULL,
    "finality_classification" TEXT NOT NULL,
    "sicab" TEXT NOT NULL,
    "sicab_registration_date" TIMESTAMP(3) NOT NULL,
    "sicab_valid_until" TIMESTAMP(3) NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fk_user_reviewer_id" TEXT,
    "rejectionReason" TEXT,

    CONSTRAINT "artisan_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "fk_user_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "ip_host" TEXT NOT NULL,
    "device" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_profile_fk_user_id_key" ON "users_profile"("fk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_profile_cpf_key" ON "users_profile"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "artisans_profile_fk_user_id_key" ON "artisans_profile"("fk_user_id");

-- AddForeignKey
ALTER TABLE "users_profile" ADD CONSTRAINT "users_profile_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artisans_profile" ADD CONSTRAINT "artisans_profile_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artisan_applications" ADD CONSTRAINT "artisan_applications_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artisan_applications" ADD CONSTRAINT "artisan_applications_fk_user_reviewer_id_fkey" FOREIGN KEY ("fk_user_reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
