/*
  Warnings:

  - A unique constraint covering the columns `[hostname]` on the table `CustomDomain` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hostname` to the `CustomDomain` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `customdomain` ADD COLUMN `hostname` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `CustomDomain_hostname_key` ON `CustomDomain`(`hostname`);
