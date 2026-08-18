// ==========================================
// LOGIN
// ==========================================

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",

        async (event) => {

            event.preventDefault();


            const username_or_email =
                document.getElementById(
                    "username_or_email"
                ).value.trim();


            const password =
                document.getElementById(
                    "password"
                ).value;


            const message =
                document.getElementById(
                    "loginMessage"
                );


            try {

                const response =
                    await fetch(
                        "/api/auth/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            credentials:
                                "include",

                            body:
                                JSON.stringify({
                                    username_or_email,
                                    password
                                })
                        }
                    );


                const data =
                    await response.json();


                if (!data.success) {

                    message.textContent =
                        data.message;

                    message.className =
                        "message error";

                    return;
                }


                // Store CSRF token.
                // Authentication remains
                // inside HttpOnly cookie.

                sessionStorage.setItem(
                    "csrfToken",
                    data.csrfToken
                );


                // Redirect according to role

                if (
                    data.user.role ===
                    "ADMIN"
                ) {

                    window.location.href =
                        "/admin.html";

                }

                else if (
                    data.user.role ===
                    "FACULTY"
                ) {

                    window.location.href =
                        "/faculty.html";

                }

                else if (
                    data.user.role ===
                    "STUDENT"
                ) {

                    window.location.href =
                        "/student.html";
                }


            } catch (error) {

                console.error(error);

                message.textContent =
                    "Server unavailable";

                message.className =
                    "message error";
            }

        }
    );
}



// ==========================================
// SHOW SIGNUP
// ==========================================

function showSignup() {

    document.getElementById(
        "loginSection"
    ).style.display = "none";


    document.getElementById(
        "signupSection"
    ).style.display = "block";
}



// ==========================================
// SHOW LOGIN
// ==========================================

function showLogin() {

    document.getElementById(
        "signupSection"
    ).style.display = "none";


    document.getElementById(
        "loginSection"
    ).style.display = "block";
}



// ==========================================
// SELECT ROLE
// ==========================================

function selectRole(role) {

    document.getElementById(
        "signupRole"
    ).value = role;


    document.getElementById(
        "signupForm"
    ).style.display = "block";


    const selectedRole =
        document.getElementById(
            "selectedRole"
        );


    selectedRole.textContent =
        "Selected Role: " + role;


    // Hide everything

    document.getElementById(
        "studentFields"
    ).style.display = "none";


    document.getElementById(
        "facultyFields"
    ).style.display = "none";


    // Show student fields

    if (role === "STUDENT") {

        document.getElementById(
            "studentFields"
        ).style.display = "block";
    }


    // Show faculty fields

    if (role === "FACULTY") {

        document.getElementById(
            "facultyFields"
        ).style.display = "block";
    }

}



// ==========================================
// SIGNUP
// ==========================================

const signupForm =
    document.getElementById(
        "signupForm"
    );


if (signupForm) {

    signupForm.addEventListener(
        "submit",

        async (event) => {

            event.preventDefault();


            const role =
                document.getElementById(
                    "signupRole"
                ).value;


            const name =
                document.getElementById(
                    "signupName"
                ).value.trim();


            const username =
                document.getElementById(
                    "signupUsername"
                ).value.trim();


            const email =
                document.getElementById(
                    "signupEmail"
                ).value.trim();


            const password =
                document.getElementById(
                    "signupPassword"
                ).value;


            const confirmPassword =
                document.getElementById(
                    "confirmPassword"
                ).value;


            const message =
                document.getElementById(
                    "signupMessage"
                );


            // Password confirmation

            if (
                password !==
                confirmPassword
            ) {

                message.textContent =
                    "Passwords do not match";

                message.className =
                    "message error";

                return;
            }


            // Create request

            const body = {

                role,

                name,

                username,

                email,

                password
            };


            // Student data

            if (
                role === "STUDENT"
            ) {

                body.roll_no =
                    document.getElementById(
                        "rollNo"
                    ).value.trim();


                body.department =
                    document.getElementById(
                        "studentDepartment"
                    ).value.trim();


                body.semester =
                    document.getElementById(
                        "semester"
                    ).value;
            }


            // Faculty data

            if (
                role === "FACULTY"
            ) {

                body.employee_id =
                    document.getElementById(
                        "employeeId"
                    ).value.trim();


                body.department =
                    document.getElementById(
                        "facultyDepartment"
                    ).value.trim();
            }


            try {

                const response =
                    await fetch(
                        "/api/auth/signup",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(body)
                        }
                    );


                const data =
                    await response.json();


                if (!data.success) {

                    message.textContent =
                        data.message;

                    message.className =
                        "message error";

                    return;
                }


                message.textContent =
                    "Account created successfully. You can now login.";

                message.className =
                    "message success";


                // Reset form

                signupForm.reset();


                setTimeout(
                    () => {

                        showLogin();

                    },
                    1500
                );


            } catch (error) {

                console.error(error);

                message.textContent =
                    "Server error";

                message.className =
                    "message error";
            }

        }
    );
}