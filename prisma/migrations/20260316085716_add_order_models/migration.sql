-- CreateTable
CREATE TABLE `order_sheet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `admin_id` INTEGER NOT NULL,
    `request_note` TEXT NULL,
    `center_name` VARCHAR(150) NOT NULL,
    `writer_phone` VARCHAR(20) NOT NULL,
    `recipient_name` VARCHAR(50) NOT NULL,
    `gender` VARCHAR(10) NOT NULL,
    `contact_phone_1` VARCHAR(20) NULL,
    `contact_phone_2` VARCHAR(20) NULL,
    `road_address` VARCHAR(255) NULL,
    `detail_address` VARCHAR(255) NULL,
    `zip_code` VARCHAR(10) NULL,
    `temp_image_ids` TEXT NULL,
    `sms_status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `sms_message` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `order_sheet_admin_id_created_at_idx`(`admin_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `product_name` VARCHAR(200) NOT NULL,
    `price` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `order_item_order_id_idx`(`order_id`),
    INDEX `order_item_product_id_idx`(`product_id`),
    INDEX `order_item_category_id_idx`(`category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `order_sheet` ADD CONSTRAINT `order_sheet_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_item` ADD CONSTRAINT `order_item_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `order_sheet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_item` ADD CONSTRAINT `order_item_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
