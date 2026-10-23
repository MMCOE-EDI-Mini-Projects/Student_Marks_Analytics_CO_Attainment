package com.obe.model;

public class Admin extends User {
    public Admin() {
        super();
        setRole("ADMIN");
    }

    public Admin(int id, String username, String passwordHash, String email, String firstName, String lastName) {
        super(id, username, passwordHash, email, "ADMIN", firstName, lastName);
    }

    @Override
    public String getRoleName() {
        return "Administrator";
    }

    @Override
    public String getDashboardRoute() {
        return "#admin-dashboard";
    }
}
