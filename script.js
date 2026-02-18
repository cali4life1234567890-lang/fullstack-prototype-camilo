// Simulated Admin Credentials
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASS = "admin1234";

// Handle Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-pass').value;

        if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userRole', 'admin');
            window.location.href = 'admin-dashboard.html';
        } else {
            alert('Invalid Credentials!');
        }
    });
}

// Global Navbar Rendering
function renderNavbar() {
    const navPlaceholder = document.getElementById('navbar-placeholder');
    if (!navPlaceholder) return;

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const role = localStorage.getItem('userRole');

    navPlaceholder.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container">
                <a class="navbar-brand" href="index.html">Full-Stack App (Your Name)</a>
                <div class="collapse navbar-collapse">
                    <ul class="navbar-nav ms-auto">
                        ${!isLoggedIn ? `
                            <li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>
                            <li class="nav-item"><a class="nav-link" href="register.html">Register</a></li>
                        ` : `
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">Admin</a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="admin-dashboard.html">Profile</a></li>
                                    <li><button class="dropdown-item" onclick="logout()">Logout</button></li>
                                </ul>
                            </li>
                        `}
                    </ul>
                </div>
            </div>
        </nav>
    `;
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', renderNavbar);