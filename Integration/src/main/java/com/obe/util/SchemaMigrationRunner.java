package com.obe.util;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * One-time, non-destructive compatibility migration for databases created by
 * an earlier schema revision. It can safely be run again: existing columns are
 * detected before an ALTER TABLE statement is issued.
 */
public final class SchemaMigrationRunner {
    private static final String[] TABLES = {"students", "subjects", "enrollments", "assessments", "attendance", "faculty_assignments"};

    private SchemaMigrationRunner() { }

    public static void main(String[] args) throws Exception {
        migrateBatchCompatibility();
        System.out.println("Batch compatibility migration completed.");
    }

    public static void migrateBatchCompatibility() throws SQLException {
        try (Connection connection = DatabaseUtil.getConnection()) {
            connection.setAutoCommit(false);
            try {
                for (String table : TABLES) {
                    if (!hasColumn(connection, table, "batch_id")) {
                        try (Statement statement = connection.createStatement()) {
                            statement.executeUpdate("ALTER TABLE `" + table + "` ADD COLUMN `batch_id` INT NULL AFTER `class_id`");
                        }
                    }
                    try (PreparedStatement statement = connection.prepareStatement(
                            "UPDATE `" + table + "` SET `batch_id` = `class_id` WHERE `batch_id` IS NULL")) {
                        statement.executeUpdate();
                    }
                }
                // Backfill students who existed before their class subject was
                // created or before enrollment automation was introduced.
                try (PreparedStatement statement = connection.prepareStatement(
                        "INSERT IGNORE INTO enrollments (student_id, subject_id, class_id, batch_id, status) " +
                                "SELECT st.id, sub.id, st.class_id, st.class_id, 'ENROLLED' " +
                                "FROM students st JOIN subjects sub ON sub.class_id = st.class_id")) {
                    statement.executeUpdate();
                }
                connection.commit();
            } catch (SQLException error) {
                connection.rollback();
                throw error;
            }
        }
    }

    private static boolean hasColumn(Connection connection, String table, String column) throws SQLException {
        DatabaseMetaData metadata = connection.getMetaData();
        try (var result = metadata.getColumns(connection.getCatalog(), null, table, column)) {
            return result.next();
        }
    }
}
