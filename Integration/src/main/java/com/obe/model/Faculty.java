package com.obe.model;

public class Faculty extends User {
    private int facultyId;
    private int departmentId;
    private String departmentCode;
    private String departmentName;
    private String designation;
    private String phone;

    public Faculty() {
        super();
        setRole("FACULTY");
    }

    public Faculty(int id, String username, String passwordHash, String email, String firstName, String lastName,
                   int facultyId, int departmentId, String designation, String phone) {
        super(id, username, passwordHash, email, "FACULTY", firstName, lastName);
        this.facultyId = facultyId;
        this.departmentId = departmentId;
        this.designation = designation;
        this.phone = phone;
    }

    @Override
    public String getRoleName() {
        return "Faculty";
    }

    @Override
    public String getDashboardRoute() {
        return "#faculty-dashboard";
    }

    public int getFacultyId() { return facultyId; }
    public void setFacultyId(int facultyId) { this.facultyId = facultyId; }

    public int getDepartmentId() { return departmentId; }
    public void setDepartmentId(int departmentId) { this.departmentId = departmentId; }

    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
