-- AlterTable
ALTER TABLE `admin_setting` ADD COLUMN `notice_text` TEXT NULL;

-- AlterTable
ALTER TABLE `order_sheet` ADD COLUMN `copay_type` VARCHAR(20) NULL;
