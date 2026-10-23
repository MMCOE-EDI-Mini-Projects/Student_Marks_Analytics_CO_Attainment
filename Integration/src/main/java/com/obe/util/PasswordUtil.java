package com.obe.util;

import org.mindrot.jbcrypt.BCrypt;

public class PasswordUtil {

    public static String hashPassword(String plainTextPassword) {
        if (plainTextPassword == null || plainTextPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }
        return BCrypt.hashpw(plainTextPassword, BCrypt.gensalt(10));
    }

    public static boolean checkPassword(String plainTextPassword, String hashedPassword) {
        if (plainTextPassword == null || hashedPassword == null || hashedPassword.trim().isEmpty()) {
            return false;
        }
        try {
            return BCrypt.checkpw(plainTextPassword, hashedPassword);
        } catch (Exception e) {
            return false;
        }
    }

    public static void main(String[] args) {
        String p1 = "admin123";
        String h1 = hashPassword(p1);
        System.out.println("admin123 hash: " + h1);
        System.out.println("Check admin123: " + checkPassword(p1, h1));
        
        String sampleHash = "$2a$10$wE99C3tGfMptd.6fF1a3OeuT1J4HhR4E3lGZ2E20VzE8i9aMv9.7W";
        System.out.println("Check sample hash with admin123: " + checkPassword("admin123", sampleHash));
    }
}
