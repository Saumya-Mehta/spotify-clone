// Spotify Web Player - Modals, Popovers & Dialog Controller
import { showToast } from "./utils.js";
import { createNewPlaylist } from "./library.js";
import { logout } from "./auth.js";

// Modal Backdrop & Elements
const playlistModal = document.getElementById("create-playlist-modal");
const playlistNameInput = document.getElementById("playlist-name-input");
const playlistDescInput = document.getElementById("playlist-desc-input");
const savePlaylistBtn = document.getElementById("save-playlist-btn");
const cancelPlaylistBtn = document.getElementById("cancel-playlist-btn");
const closePlaylistModalBtn = document.getElementById("close-playlist-modal-btn");

const premiumModal = document.getElementById("premium-modal");
const closePremiumModalBtn = document.getElementById("close-premium-modal-btn");
const getPremiumButtons = document.querySelectorAll(".get-plan-btn");

const installAppModal = document.getElementById("install-app-modal");
const closeInstallModalBtn = document.getElementById("close-install-modal-btn");
const downloadAppBtn = document.getElementById("download-app-btn");

const profilePopover = document.getElementById("profile-popover");
const userAvatarBtn = document.querySelector(".user-avatar");
const profileItems = document.querySelectorAll(".profile-item");

const languageModal = document.getElementById("language-modal");
const closeLangModalBtn = document.getElementById("close-lang-modal-btn");
const langChoices = document.querySelectorAll(".lang-choice-btn");
const langBtn = document.querySelector(".lang-btn span");

const legalModal = document.getElementById("legal-modal");
const closeLegalModalBtn = document.getElementById("close-legal-modal-btn");
const legalTabButtons = document.querySelectorAll(".legal-tab-btn");
const legalTextContent = document.getElementById("legal-text-content");

/**
 * Open Create Playlist Modal
 */
export function openCreatePlaylistModal() {
    if (!playlistModal) return;
    playlistModal.classList.add("show");
    if (playlistNameInput) {
        playlistNameInput.value = "";
        playlistNameInput.focus();
    }
    if (playlistDescInput) playlistDescInput.value = "";
}

export function closeCreatePlaylistModal() {
    if (playlistModal) playlistModal.classList.remove("show");
}

/**
 * Open Premium Plans Modal
 */
export function openPremiumModal() {
    if (premiumModal) premiumModal.classList.add("show");
}

export function closePremiumModal() {
    if (premiumModal) premiumModal.classList.remove("show");
}

/**
 * Open Install App Modal
 */
export function openInstallAppModal() {
    if (installAppModal) installAppModal.classList.add("show");
}

export function closeInstallAppModal() {
    if (installAppModal) installAppModal.classList.remove("show");
}

/**
 * Toggle User Profile Popover
 */
export function toggleProfilePopover() {
    if (profilePopover) {
        profilePopover.classList.toggle("show");
    }
}

export function closeProfilePopover() {
    if (profilePopover) profilePopover.classList.remove("show");
}

/**
 * Open Language Selection Modal
 */
export function openLanguageModal() {
    if (languageModal) languageModal.classList.add("show");
}

export function closeLanguageModal() {
    if (languageModal) languageModal.classList.remove("show");
}

/**
 * Open Legal & Privacy Modal with specific tab
 */
export function openLegalModal(tabName = "Legal") {
    if (!legalModal) return;
    legalModal.classList.add("show");
    switchLegalTab(tabName);
}

export function closeLegalModal() {
    if (legalModal) legalModal.classList.remove("show");
}

const legalTexts = {
    "Legal": "Spotify Clone is an educational demonstration reproducing Spotify's desktop design and web platform interfaces. All music, artwork, and trademarks belong to their respective copyright owners.",
    "Privacy Center": "We value your privacy. This clone does not sell or share personal data. Your liked songs and custom playlists are stored solely on your local computer using browser LocalStorage.",
    "Privacy Policy": "Our privacy principles are transparent: we collect zero tracking cookies or analytics. Any preferences you select (such as language or playlists) remain inside your browser sandbox.",
    "Cookies": "This application uses only essential browser storage (LocalStorage) to persist your Liked Songs and volume levels across browser refreshes. No third-party tracking cookies are deployed."
};

function switchLegalTab(tabName) {
    legalTabButtons.forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    if (legalTextContent) {
        legalTextContent.textContent = legalTexts[tabName] || legalTexts["Legal"];
    }
}

// Wire up modal events
if (savePlaylistBtn) {
    savePlaylistBtn.addEventListener("click", () => {
        const name = playlistNameInput ? playlistNameInput.value : "";
        const desc = playlistDescInput ? playlistDescInput.value : "";
        createNewPlaylist(name, desc);
        closeCreatePlaylistModal();
    });
}

if (cancelPlaylistBtn) cancelPlaylistBtn.addEventListener("click", closeCreatePlaylistModal);
if (closePlaylistModalBtn) closePlaylistModalBtn.addEventListener("click", closeCreatePlaylistModal);

if (closePremiumModalBtn) closePremiumModalBtn.addEventListener("click", closePremiumModal);
getPremiumButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const plan = btn.dataset.plan || "Individual";
        showToast(`Spotify Premium (${plan}) activated!`, "spotify-green", "fa-solid fa-crown");
        closePremiumModal();
    });
});

if (closeInstallModalBtn) closeInstallModalBtn.addEventListener("click", closeInstallAppModal);
if (downloadAppBtn) {
    downloadAppBtn.addEventListener("click", () => {
        showToast("Starting Spotify App download...", "spotify-green", "fa-solid fa-download");
        closeInstallAppModal();
    });
}

if (closeLangModalBtn) closeLangModalBtn.addEventListener("click", closeLanguageModal);
langChoices.forEach(choice => {
    choice.addEventListener("click", () => {
        langChoices.forEach(c => c.classList.remove("active"));
        choice.classList.add("active");
        const langName = choice.dataset.lang || "English";
        if (langBtn) langBtn.textContent = langName;
        showToast(`Language set to ${langName}`, "spotify-green", "fa-solid fa-globe");
        closeLanguageModal();
    });
});

if (closeLegalModalBtn) closeLegalModalBtn.addEventListener("click", closeLegalModal);
legalTabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        switchLegalTab(btn.dataset.tab);
    });
});

profileItems.forEach(item => {
    item.addEventListener("click", () => {
        const action = item.dataset.action;
        closeProfilePopover();
        if (action === "premium") {
            openPremiumModal();
        } else if (action === "logout") {
            logout();
        } else {
            showToast(`${item.textContent.trim()} opened`, "spotify-dark", "fa-solid fa-circle-info");
        }
    });
});

// Click outside to close modals
window.addEventListener("click", (e) => {
    if (e.target === playlistModal) closeCreatePlaylistModal();
    if (e.target === premiumModal) closePremiumModal();
    if (e.target === installAppModal) closeInstallAppModal();
    if (e.target === languageModal) closeLanguageModal();
    if (e.target === legalModal) closeLegalModal();

    if (profilePopover && profilePopover.classList.contains("show")) {
        if (!profilePopover.contains(e.target) && userAvatarBtn && !userAvatarBtn.contains(e.target)) {
            closeProfilePopover();
        }
    }
});
