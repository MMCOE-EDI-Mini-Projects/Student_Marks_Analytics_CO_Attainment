-- Run once on an existing obe_db created from an earlier schema.sql revision.
-- Take a database backup first. This preserves all existing academic records.
USE `obe_db`;

ALTER TABLE `students`
    ADD COLUMN `batch_id` INT NULL AFTER `class_id`,
    ADD CONSTRAINT `fk_students_batch_compat` FOREIGN KEY (`batch_id`)
        REFERENCES `classes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `subjects`
    ADD COLUMN `batch_id` INT NULL AFTER `class_id`,
    ADD CONSTRAINT `fk_subjects_batch_compat` FOREIGN KEY (`batch_id`)
        REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `enrollments`
    ADD COLUMN `batch_id` INT NULL AFTER `class_id`,
    ADD CONSTRAINT `fk_enrollments_batch_compat` FOREIGN KEY (`batch_id`)
        REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `assessments`
    ADD COLUMN `batch_id` INT NULL AFTER `class_id`,
    ADD CONSTRAINT `fk_assessments_batch_compat` FOREIGN KEY (`batch_id`)
        REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `attendance`
    ADD COLUMN `batch_id` INT NULL AFTER `class_id`,
    ADD CONSTRAINT `fk_attendance_batch_compat` FOREIGN KEY (`batch_id`)
        REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `faculty_assignments`
    ADD COLUMN `batch_id` INT NULL AFTER `class_id`,
    ADD CONSTRAINT `fk_faculty_assignments_batch_compat` FOREIGN KEY (`batch_id`)
        REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

UPDATE `students` SET `batch_id` = `class_id` WHERE `batch_id` IS NULL;
UPDATE `subjects` SET `batch_id` = `class_id` WHERE `batch_id` IS NULL;
UPDATE `enrollments` SET `batch_id` = `class_id` WHERE `batch_id` IS NULL;
UPDATE `assessments` SET `batch_id` = `class_id` WHERE `batch_id` IS NULL;
UPDATE `attendance` SET `batch_id` = `class_id` WHERE `batch_id` IS NULL;
UPDATE `faculty_assignments` SET `batch_id` = `class_id` WHERE `batch_id` IS NULL;

-- Enroll existing class members in all subjects delivered to their class.
-- INSERT IGNORE preserves any historical enrollment row that already exists.
INSERT IGNORE INTO `enrollments` (`student_id`, `subject_id`, `class_id`, `batch_id`, `status`)
SELECT st.`id`, sub.`id`, st.`class_id`, st.`class_id`, 'ENROLLED'
FROM `students` st
JOIN `subjects` sub ON sub.`class_id` = st.`class_id`;
