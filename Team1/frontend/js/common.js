async function getCurrentUser() {

    const response =
        await fetch(
            "/api/auth/me",
            {
                credentials: "include"
            }
        );


    if (!response.ok) {

        window.location.href =
            "login.html";

        return null;
    }


    const data =
        await response.json();


    return data.user;
}


// ==========================================
// LOGOUT
// ==========================================

async function logout() {

    const csrfToken =
        sessionStorage.getItem(
            "csrfToken"
        );


    const response =
        await fetch(
            "/api/auth/logout",
            {
                method: "POST",

                credentials: "include",

                headers: {
                    "X-CSRF-Token":
                        csrfToken
                }
            }
        );


    const data =
        await response.json();


    sessionStorage.removeItem(
        "csrfToken"
    );


    window.location.href =
        "login.html";
}


// ==========================================
// LOGOUT ALL
// ==========================================

async function logoutAll() {

    const csrfToken =
        sessionStorage.getItem(
            "csrfToken"
        );


    await fetch(
        "/api/auth/logout-all",
        {
            method: "POST",

            credentials: "include",

            headers: {
                "X-CSRF-Token":
                    csrfToken
            }
        }
    );


    sessionStorage.removeItem(
        "csrfToken"
    );


    window.location.href =
        "login.html";
}