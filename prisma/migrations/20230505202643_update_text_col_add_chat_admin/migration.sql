-- AlterTable
ALTER TABLE `Chat` ADD COLUMN `adminId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Message` MODIFY `text` TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
