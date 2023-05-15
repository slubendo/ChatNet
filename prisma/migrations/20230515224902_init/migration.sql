/*
  Warnings:

  - You are about to drop the column `secureId` on the `Chat` table. All the data in the column will be lost.
  - Made the column `adminId` on table `Chat` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Chat` DROP FOREIGN KEY `Chat_adminId_fkey`;

-- AlterTable
ALTER TABLE `Chat` DROP COLUMN `secureId`,
    MODIFY `adminId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
