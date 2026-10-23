package com.obe.util;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class DatabaseUtil {
    private static String dbUrl;
    private static String dbUser;
    private static String dbPassword;

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            
            // Read from env vars or application.properties file
            Properties props = new Properties();
            try (InputStream input = DatabaseUtil.class.getClassLoader().getResourceAsStream("db.properties")) {
                if (input != null) {
                    props.load(input);
                }
            } catch (Exception ignored) {}

            dbUrl = System.getenv("DB_URL");
            if (dbUrl == null || dbUrl.trim().isEmpty()) {
                dbUrl = props.getProperty("db.url", "jdbc:mysql://localhost:3306/obe_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC");
            }

            dbUser = System.getenv("DB_USER");
            if (dbUser == null || dbUser.trim().isEmpty()) {
                dbUser = props.getProperty("db.user", "root");
            }

            dbPassword = System.getenv("DB_PASS");
            if (dbPassword == null) {
                dbPassword = props.getProperty("db.password", "root");
            }
        } catch (ClassNotFoundException e) {
            System.err.println("MySQL Driver not found: " + e.getMessage());
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(dbUrl, dbUser, dbPassword);
    }
}
