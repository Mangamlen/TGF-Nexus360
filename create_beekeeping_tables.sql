-- SQL for creating beekeeping management tables

-- Drop tables if they exist to ensure a clean slate on re-running
DROP TABLE IF EXISTS `box_history`;
DROP TABLE IF EXISTS `bee_boxes`;

-- Main table to store information about each bee box
CREATE TABLE `bee_boxes` (
    `box_id` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `acquired_date` DATE NOT NULL,
    `status` ENUM('ACTIVE', 'EMPTY', 'ABSCONDED') NOT NULL DEFAULT 'EMPTY',
    `location` ENUM('APIARY', 'DISTRIBUTED', 'TRAVELING') NOT NULL DEFAULT 'APIARY',
    `distributed_to` VARCHAR(255) NULL,
    `last_updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`box_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table to log all significant events and changes for each bee box
CREATE TABLE `box_history` (
    `history_id` INT AUTO_INCREMENT PRIMARY KEY,
    `box_id` VARCHAR(255) NOT NULL,
    `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `event_type` VARCHAR(50) NOT NULL COMMENT 'e.g., ''STATUS_CHANGE'', ''LOCATION_CHANGE'', ''CREATED''',
    `old_value` TEXT NULL,
    `new_value` TEXT NULL,
    `notes` TEXT NULL,
    `recorded_by` INT(11) NULL COMMENT 'User ID of the person who made the change',
    FOREIGN KEY (`box_id`) REFERENCES `bee_boxes`(`box_id`) ON DELETE CASCADE,
    FOREIGN KEY (`recorded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add some indexes for performance
CREATE INDEX `idx_bee_boxes_status` ON `bee_boxes` (`status`);
CREATE INDEX `idx_bee_boxes_location` ON `bee_boxes` (`location`);
CREATE INDEX `idx_box_history_box_id` ON `box_history` (`box_id`);

