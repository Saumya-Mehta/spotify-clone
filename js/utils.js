// Spotify Web Player - Utility Functions

let toastTimer = null;

/**
 * Display a Spotify sleek toast notification at the bottom
 */
export function showToast(message, type = "spotify-dark", iconClass = "fa-solid fa-circle-check") {
    const toast = document.getElementById("toast");
    const toastMsg = document.getElementById("toast-message");
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    const icon = toast.querySelector("i");
    if (icon) icon.className = iconClass;

    toast.className = `spotify-toast ${type} show`;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

/**
 * Format raw seconds to MM:SS string
 */
export function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Escape raw user input to prevent Cross-Site Scripting (XSS)
 */
export function escapeHtml(text) {
    if (!text) return "";
    return String(text).replace(/[&<>"']/g, (m) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[m]));
}
