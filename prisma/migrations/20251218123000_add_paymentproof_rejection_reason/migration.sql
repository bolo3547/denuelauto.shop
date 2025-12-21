-- Add rejectionReason to PaymentProof
ALTER TABLE `PaymentProof` ADD COLUMN `rejectionReason` VARCHAR(191) NULL;