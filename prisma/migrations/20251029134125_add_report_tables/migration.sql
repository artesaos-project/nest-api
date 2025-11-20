-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('INAPPROPRIATE_CONTENT', 'OFFENSIVE_CONTENT', 'FALSE_OR_MISLEADING_INFORMATION', 'COPYRIGHT_VIOLATION', 'PROHIBITED_ITEM_SALE_OR_DISCLOSURE', 'INAPPROPRIATE_LANGUAGE', 'OFF_TOPIC_OR_IRRELEVANT', 'OTHER');

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "fk_reporter_id" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "description" TEXT,
    "is_solved" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports_users" (
    "fk_report_id" TEXT NOT NULL,
    "fk_reported_user_id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,

    CONSTRAINT "reports_users_pkey" PRIMARY KEY ("fk_report_id")
);

-- CreateTable
CREATE TABLE "reports_products" (
    "fk_report_id" TEXT NOT NULL,
    "fk_product_id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,

    CONSTRAINT "reports_products_pkey" PRIMARY KEY ("fk_report_id")
);

-- CreateTable
CREATE TABLE "reports_product_ratings" (
    "fk_report_id" TEXT NOT NULL,
    "fk_product_rating_id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,

    CONSTRAINT "reports_product_ratings_pkey" PRIMARY KEY ("fk_report_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reports_users_reporterId_fk_reported_user_id_key" ON "reports_users"("reporterId", "fk_reported_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "reports_products_reporterId_fk_product_id_key" ON "reports_products"("reporterId", "fk_product_id");

-- CreateIndex
CREATE UNIQUE INDEX "reports_product_ratings_reporterId_fk_product_rating_id_key" ON "reports_product_ratings"("reporterId", "fk_product_rating_id");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_fk_reporter_id_fkey" FOREIGN KEY ("fk_reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports_users" ADD CONSTRAINT "reports_users_fk_report_id_fkey" FOREIGN KEY ("fk_report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports_users" ADD CONSTRAINT "reports_users_fk_reported_user_id_fkey" FOREIGN KEY ("fk_reported_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports_products" ADD CONSTRAINT "reports_products_fk_report_id_fkey" FOREIGN KEY ("fk_report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports_products" ADD CONSTRAINT "reports_products_fk_product_id_fkey" FOREIGN KEY ("fk_product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports_product_ratings" ADD CONSTRAINT "reports_product_ratings_fk_report_id_fkey" FOREIGN KEY ("fk_report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports_product_ratings" ADD CONSTRAINT "reports_product_ratings_fk_product_rating_id_fkey" FOREIGN KEY ("fk_product_rating_id") REFERENCES "product_ratings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
