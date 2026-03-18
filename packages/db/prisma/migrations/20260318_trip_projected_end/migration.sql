/*
  Warnings:

  - You are about to drop the column `plannedEndTime` on the `trip` table. All the data will be lost.
  - You are about to drop the column `actualEndTime` on the `trip` table. All the data will be lost.
  - Added the required column `projectedEndTime` to the `trip` table without a constraint

*/
-- AlterTable
ALTER TABLE "trip" DROP COLUMN "plannedEndTime",
DROP COLUMN "actualEndTime",
ADD COLUMN "projectedEndTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN "endTime" TIMESTAMP(3);
