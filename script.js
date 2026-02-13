let currentUser = null;

/* ================= REGISTER ================= */

document.addEventListener("DOMContentLoaded", () => {

    if (!localStorage.getItem("users")) {
        localStorage.setItem("users", JSON.stringify([
            {
                firstName: "Admin",
                lastName: "User",
                email: "admin@email.com",
                password: "123",
                role: "admin"
            }
        ]));
    }

    handleRouting();

    window.addEventListener("hashchange", handleRouting);

    document.getElementById("register-form")
        ?.addEventListener("submit", registerUser);

    document.getElementById("login-form")
        ?.addEventListener("submit", loginUser);

    document.getElementById("logout-btn")
        ?.addEventListener("click", logout);
});

/* ================= ROUTING ================= */

function navigateTo(hash) {
    window.location.hash = hash;
}

function handleRouting() {

    let route = location.hash.replace("#/", "") || "home";

    if (route === "home") {
        setLoggedOut(true);
    }

    document.querySelectorAll(".page")
        .forEach(p => p.classList.remove("active"));

    const protectedRoutes = ["profile", "requests"];
    const adminRoutes = ["employees", "departments", "accounts"];

    if (protectedRoutes.includes(route) && !currentUser) {
        navigateTo("#/login");
        return;
    }

    if (adminRoutes.includes(route) &&
        (!currentUser || currentUser.role !== "admin")) {
        navigateTo("#/");
        return;
    }

    document.getElementById(route + "-page")
        ?.classList.add("active");
}

/* ================= REGISTER ================= */

function registerUser(e) {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("users"));

    const newUser = {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        password: password.value,
        role: "user"
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Registration successful!");
    navigateTo("#/login");
}

/* ================= LOGIN ================= */

function loginUser(e) {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("users"));

    const user = users.find(u =>
        u.email === loginEmail.value &&
        u.password === loginPassword.value
    );

    if (!user) {
        alert("Invalid credentials");
        return;
    }

    currentUser = user;

    document.body.classList.remove("not-authenticated");
    document.body.classList.add("authenticated");

    if (user.role === "admin") {
        document.body.classList.add("is-admin");
    }

    document.getElementById("nav-username").innerText =
        user.firstName;

    showProfile();
    navigateTo("#/");
}

/* ================= PROFILE ================= */

function showProfile() {
    if (!currentUser) return;

    document.getElementById("profile-info").innerHTML = `
        <p><strong>Name:</strong> ${currentUser.firstName} ${currentUser.lastName}</p>
        <p><strong>Email:</strong> ${currentUser.email}</p>
        <p><strong>Role:</strong> ${currentUser.role}</p>
    `;
}

/* ================= LOGOUT ================= */

function logout() {
    setLoggedOut(false);
}

function setLoggedOut(silent = false) {
    currentUser = null;
    document.body.classList.remove("authenticated", "is-admin");
    document.body.classList.add("not-authenticated", "bg-light");
    const navUsername = document.getElementById("nav-username");
    if (navUsername) navUsername.innerText = "Username";
    if (!silent) navigateTo("#/");
}
