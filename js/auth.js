// Spotify Web Player - Client-Side Authentication Simulation (js/auth.js)
import { showToast } from "./utils.js";

const STORAGE_USERS = "spotify_clone_users";
const STORAGE_CURRENT_USER = "spotify_clone_current_user";

// Pre-configured demo user
const DEMO_USER = {
    id: "usr_demo",
    name: "Alex Rivera",
    email: "alex@spotify.com",
    password: "password123",
    plan: "Free Plan"
};

// Initialize Users in localStorage
let users = [];
try {
    const saved = localStorage.getItem(STORAGE_USERS);
    users = saved ? JSON.parse(saved) : [DEMO_USER];
    if (!saved) localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
} catch (e) {
    users = [DEMO_USER];
}

// Initialize Current User session (defaults to logged in as demo user)
let currentUser = null;
try {
    const savedUser = localStorage.getItem(STORAGE_CURRENT_USER);
    if (savedUser !== null) {
        currentUser = savedUser ? JSON.parse(savedUser) : null;
    } else {
        currentUser = DEMO_USER;
        localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(currentUser));
    }
} catch (e) {
    currentUser = DEMO_USER;
}

const profilePopover = document.getElementById("profile-popover");

/**
 * Get the currently logged-in user or null
 */
export function getCurrentUser() {
    return currentUser;
}

export function isLoggedIn() {
    return currentUser !== null;
}

/**
 * Log in with email/username and password
 */
export function login(emailOrName, password) {
    const query = (emailOrName || "").trim().toLowerCase();
    const pass = (password || "").trim();

    if (!query || !pass) {
        showAuthError("Please fill in both email and password.");
        return false;
    }

    const matchedUser = users.find(u => 
        (u.email.toLowerCase() === query || u.name.toLowerCase() === query) && u.password === pass
    );

    if (!matchedUser) {
        showAuthError("Incorrect username or password. Click '⚡ Demo User' to auto-fill!");
        return false;
    }

    currentUser = matchedUser;
    try {
        localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(currentUser));
    } catch (e) {
        console.warn("Storage error", e);
    }

    updateAuthUI();
    closeAuthModal();
    showToast(`Welcome back, ${currentUser.name}!`, "spotify-green", "fa-solid fa-circle-user");
    return true;
}

/**
 * Sign up a new user
 */
export function signup(name, email, password) {
    const cleanName = (name || "").trim();
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    if (!cleanName || !cleanEmail || !cleanPass) {
        showAuthError("All fields are required.");
        return false;
    }

    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
        showAuthError("Please enter a valid email address.");
        return false;
    }

    if (cleanPass.length < 6) {
        showAuthError("Password must be at least 6 characters long.");
        return false;
    }

    const emailExists = users.some(u => u.email.toLowerCase() === cleanEmail);
    if (emailExists) {
        showAuthError("An account with this email already exists. Please log in.");
        return false;
    }

    const newUser = {
        id: "usr_" + Date.now(),
        name: cleanName,
        email: cleanEmail,
        password: cleanPass,
        plan: "Free Plan"
    };

    users.push(newUser);
    currentUser = newUser;

    try {
        localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
        localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(currentUser));
    } catch (e) {
        console.warn("Storage error", e);
    }

    updateAuthUI();
    closeAuthModal();
    showToast(`Account created! Welcome, ${newUser.name}!`, "spotify-green", "fa-solid fa-sparkles");
    return true;
}

/**
 * Log out current user
 */
export function logout() {
    currentUser = null;
    try {
        localStorage.removeItem(STORAGE_CURRENT_USER);
    } catch (e) {
        console.warn("Storage error", e);
    }

    const popover = document.getElementById("profile-popover");
    if (popover) popover.classList.remove("show");
    updateAuthUI();
    showToast("Logged out of Spotify Clone", "spotify-dark", "fa-solid fa-right-from-bracket");
}

/**
 * Update UI according to logged in / logged out state
 */
export function updateAuthUI() {
    const guestNav = document.getElementById("guest-nav-actions");
    const userNav = document.getElementById("user-nav-actions");
    const avatarInitial = document.getElementById("user-avatar-initial");
    const popName = document.getElementById("popover-profile-name");
    const popEmail = document.getElementById("popover-profile-email");

    if (currentUser) {
        if (guestNav) guestNav.style.display = "none";
        if (userNav) userNav.style.display = "flex";

        const initial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U";
        if (avatarInitial) avatarInitial.textContent = initial;
        if (popName) popName.textContent = currentUser.name;
        if (popEmail) popEmail.textContent = currentUser.email;
    } else {
        if (guestNav) guestNav.style.display = "flex";
        if (userNav) userNav.style.display = "none";
    }
}

/**
 * Show error message inside auth modal
 */
function showAuthError(msg) {
    const errorEl = document.getElementById("auth-error-msg");
    if (errorEl) {
        errorEl.textContent = msg;
        errorEl.style.display = "block";
    }
}

function clearAuthError() {
    const errorEl = document.getElementById("auth-error-msg");
    if (errorEl) {
        errorEl.textContent = "";
        errorEl.style.display = "none";
    }
}

/**
 * Open Auth Modal in 'login' or 'signup' mode
 */
export function openAuthModal(mode = "login") {
    const modal = document.getElementById("auth-modal");
    if (!modal) return;
    modal.classList.add("show");
    clearAuthError();
    switchAuthMode(mode);
}

export function closeAuthModal() {
    const modal = document.getElementById("auth-modal");
    if (modal) modal.classList.remove("show");
    clearAuthError();
}

/**
 * Switch between Login and Signup modes
 */
export function switchAuthMode(mode) {
    const title = document.getElementById("auth-modal-title");
    const tabLogin = document.getElementById("auth-tab-login");
    const tabSignup = document.getElementById("auth-tab-signup");
    const formLogin = document.getElementById("auth-login-form");
    const formSignup = document.getElementById("auth-signup-form");
    const prompt = document.getElementById("auth-toggle-prompt");
    const toggleBtn = document.getElementById("auth-toggle-btn");

    clearAuthError();

    if (mode === "signup") {
        if (title) title.textContent = "Sign up for Spotify";
        if (tabLogin) tabLogin.classList.remove("active");
        if (tabSignup) tabSignup.classList.add("active");
        if (formLogin) formLogin.style.display = "none";
        if (formSignup) formSignup.style.display = "flex";
        if (prompt) prompt.textContent = "Already have an account?";
        if (toggleBtn) toggleBtn.textContent = "Log in here";
        const nameInput = document.getElementById("signup-name");
        if (nameInput) nameInput.focus();
    } else {
        if (title) title.textContent = "Log in to Spotify";
        if (tabLogin) tabLogin.classList.add("active");
        if (tabSignup) tabSignup.classList.remove("active");
        if (formLogin) formLogin.style.display = "flex";
        if (formSignup) formSignup.style.display = "none";
        if (prompt) prompt.textContent = "Don't have an account?";
        if (toggleBtn) toggleBtn.textContent = "Sign up for Spotify";
        const emailInput = document.getElementById("login-email");
        if (emailInput) emailInput.focus();
    }
}

// Auto-fill demo account details
export function fillDemoAccount() {
    const emailInput = document.getElementById("login-email");
    const passInput = document.getElementById("login-password");
    if (emailInput) emailInput.value = DEMO_USER.email;
    if (passInput) passInput.value = DEMO_USER.password;
    clearAuthError();
    showToast("Demo user credentials loaded", "spotify-green", "fa-solid fa-bolt");
}

/**
 * Initialize all Auth Event Listeners
 */
export function initAuthListeners() {
    // Nav Buttons
    const navLogin = document.getElementById("nav-login-btn");
    const navSignup = document.getElementById("nav-signup-btn");
    if (navLogin) navLogin.addEventListener("click", () => openAuthModal("login"));
    if (navSignup) navSignup.addEventListener("click", () => openAuthModal("signup"));

    // Modal Close
    const closeBtn = document.getElementById("close-auth-modal-btn");
    if (closeBtn) closeBtn.addEventListener("click", closeAuthModal);

    // Tab buttons
    const tabLogin = document.getElementById("auth-tab-login");
    const tabSignup = document.getElementById("auth-tab-signup");
    if (tabLogin) tabLogin.addEventListener("click", () => switchAuthMode("login"));
    if (tabSignup) tabSignup.addEventListener("click", () => switchAuthMode("signup"));

    // Toggle footer link
    const toggleBtn = document.getElementById("auth-toggle-btn");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const formLogin = document.getElementById("auth-login-form");
            const isLogin = formLogin && formLogin.style.display !== "none";
            switchAuthMode(isLogin ? "signup" : "login");
        });
    }

    // Demo Auto Fill
    const demoBtn = document.getElementById("auth-demo-btn");
    if (demoBtn) demoBtn.addEventListener("click", fillDemoAccount);

    // Login Form Submit
    const formLogin = document.getElementById("auth-login-form");
    if (formLogin) {
        formLogin.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email")?.value;
            const pass = document.getElementById("login-password")?.value;
            login(email, pass);
        });
    }

    // Signup Form Submit
    const formSignup = document.getElementById("auth-signup-form");
    if (formSignup) {
        formSignup.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("signup-name")?.value;
            const email = document.getElementById("signup-email")?.value;
            const pass = document.getElementById("signup-password")?.value;
            signup(name, email, pass);
        });
    }

    // Click backdrop to close
    window.addEventListener("click", (e) => {
        const modal = document.getElementById("auth-modal");
        if (e.target === modal) closeAuthModal();
    });

    // Initial render
    updateAuthUI();
}
