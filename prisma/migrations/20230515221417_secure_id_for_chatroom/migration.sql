/*
  Warnings:

  - A unique constraint covering the columns `[secureId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.
  - The required column `secureId` was added to the `Chat` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE `Chat` ADD COLUMN `secureId` VARCHAR(191) NOT NULL;

/**
-- CreateIndex
CREATE UNIQUE INDEX `Chat_secureId_key` ON `Chat`(`secureId`);
**/