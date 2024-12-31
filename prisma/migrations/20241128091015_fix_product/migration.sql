/*
  Warnings:

  - You are about to drop the column `color` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isFeatured` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "color",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL,
ADD COLUMN     "promotion" DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");
