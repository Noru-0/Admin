/*
  Warnings:

  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `kind` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `material` on the `Product` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - A unique constraint covering the columns `[lowercaseName]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `brand` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chipset` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `disk` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lowercaseName` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `os` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ram` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refreshRate` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `release_time` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `screenSize` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Made the column `promotion` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "category",
DROP COLUMN "gender",
DROP COLUMN "kind",
DROP COLUMN "material",
ADD COLUMN     "brand" TEXT NOT NULL,
ADD COLUMN     "chipset" TEXT NOT NULL,
ADD COLUMN     "disk" INTEGER NOT NULL,
ADD COLUMN     "lowercaseName" TEXT NOT NULL,
ADD COLUMN     "number" INTEGER NOT NULL,
ADD COLUMN     "os" TEXT NOT NULL,
ADD COLUMN     "ram" INTEGER NOT NULL,
ADD COLUMN     "refreshRate" INTEGER NOT NULL,
ADD COLUMN     "release_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "screenSize" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "price" SET DATA TYPE INTEGER,
ALTER COLUMN "promotion" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user',
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "expire" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_sid_key" ON "Session"("sid");

-- CreateIndex
CREATE UNIQUE INDEX "Product_lowercaseName_key" ON "Product"("lowercaseName");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
