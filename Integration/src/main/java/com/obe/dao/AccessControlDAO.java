package com.obe.dao;

import com.obe.util.DatabaseUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/** Database-backed ownership checks used by protected servlet endpoints. */
public class AccessControlDAO {
    public boolean facultyAssignedTo(int facultyId, int subjectId, int classId) throws SQLException {
        return exists("SELECT 1 FROM faculty_assignments WHERE faculty_id = ? AND subject_id = ? AND class_id = ?",
                facultyId, subjectId, classId);
    }

    public boolean facultyAssignedToClass(int facultyId, int classId) throws SQLException {
        return exists("SELECT 1 FROM faculty_assignments WHERE faculty_id = ? AND class_id = ?", facultyId, classId);
    }

    public boolean studentEnrolledIn(int studentId, int subjectId, int classId) throws SQLException {
        return exists("SELECT 1 FROM enrollments WHERE student_id = ? AND subject_id = ? AND class_id = ? AND status = 'ENROLLED'",
                studentId, subjectId, classId);
    }

    public boolean studentInClass(int studentId, int classId) throws SQLException {
        return exists("SELECT 1 FROM students WHERE id = ? AND class_id = ?", studentId, classId);
    }

    public boolean courseOutcomeBelongsToSubject(int coId, int subjectId) throws SQLException {
        return exists("SELECT 1 FROM course_outcomes WHERE id = ? AND subject_id = ?", coId, subjectId);
    }

    private boolean exists(String sql, int... values) throws SQLException {
        try (Connection connection = DatabaseUtil.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            for (int i = 0; i < values.length; i++) statement.setInt(i + 1, values[i]);
            try (ResultSet result = statement.executeQuery()) {
                return result.next();
            }
        }
    }
}
