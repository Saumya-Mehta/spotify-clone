// Spotify Web Player - Library & Liked Songs Manager
import { playlist } from "./data.js";
import { showToast } from "./utils.js";

// LocalStorage Keys
const STORAGE_LIKED_SONGS = "spotify_clone_liked_songs";
const STORAGE_USER_PLAYLISTS = "spotify_clone_user_playlists";

// Initialize Liked Songs from localStorage (default to [0, 1] so new users have initial tracks)
let likedIndices = [];
try {
    const saved = localStorage.getItem(STORAGE_LIKED_SONGS);
    likedIndices = saved ? JSON.parse(saved) : [0, 1];
} catch (e) {
    likedIndices = [0, 1];
}

// Initialize Custom Playlists from localStorage
let userPlaylists = [];
try {
    const savedPlaylists = localStorage.getItem(STORAGE_USER_PLAYLISTS);
    userPlaylists = savedPlaylists ? JSON.parse(savedPlaylists) : [];
} catch (e) {
    userPlaylists = [];
}

// DOM Elements
const libLikedSongsBtn = document.getElementById("lib-liked-songs-btn");
const libLikedCount = document.getElementById("lib-liked-count");
const likedSongsView = document.getElementById("liked-songs-view");
const homeView = document.getElementById("home-view");
const searchView = document.getElementById("search-view");
const likedTracksList = document.getElementById("liked-tracks-list");
const likedHeroCount = document.getElementById("liked-hero-count");
const emptyLikedState = document.getElementById("empty-liked-state");
const trackTableContainer = document.querySelector(".track-table-container");
const userPlaylistsList = document.getElementById("user-playlists-list");
const mainContent = document.querySelector(".main-content");
const navHomeBtn = document.getElementById("nav-home-btn");

/**
 * Check if a track index is currently liked
 */
export function isTrackLiked(trackIndex) {
    return likedIndices.includes(trackIndex);
}

/**
 * Get all liked song indices
 */
export function getLikedIndices() {
    return [...likedIndices];
}

/**
 * Toggle like for a track index
 */
export function toggleLikeTrack(trackIndex, updateUIHeart) {
    const idx = likedIndices.indexOf(trackIndex);
    let nowLiked = false;

    if (idx !== -1) {
        likedIndices.splice(idx, 1);
        nowLiked = false;
        showToast("Removed from Liked Songs", "spotify-dark", "fa-regular fa-heart");
    } else {
        likedIndices.unshift(trackIndex); // Add to beginning
        nowLiked = true;
        showToast("Added to Liked Songs", "spotify-green", "fa-solid fa-heart");
    }

    try {
        localStorage.setItem(STORAGE_LIKED_SONGS, JSON.stringify(likedIndices));
    } catch (e) {
        console.warn("Storage save error", e);
    }

    if (updateUIHeart) updateUIHeart(nowLiked);
    updateLibrarySidebarCount();

    // If currently viewing liked songs page, refresh table
    if (likedSongsView && likedSongsView.style.display !== "none") {
        renderLikedSongsTable();
    }

    return nowLiked;
}

/**
 * Update Liked Songs count in sidebar
 */
export function updateLibrarySidebarCount() {
    const count = likedIndices.length;
    if (libLikedCount) libLikedCount.textContent = count;
    if (likedHeroCount) likedHeroCount.textContent = `${count} ${count === 1 ? 'song' : 'songs'}`;
}

/**
 * Show Dedicated Liked Songs View
 */
export function showLikedSongsView() {
    const mobLib = document.getElementById("mobile-nav-library");
    const mobItems = document.querySelectorAll(".mobile-nav-item");
    if (mobItems.length) mobItems.forEach(m => m.classList.remove("active"));
    if (mobLib) mobLib.classList.add("active");

    if (navHomeBtn) navHomeBtn.classList.remove("active");
    if (homeView) homeView.style.display = "none";
    if (searchView) searchView.style.display = "none";
    if (likedSongsView) likedSongsView.style.display = "block";
    if (libLikedSongsBtn) libLikedSongsBtn.classList.add("active");
    if (mainContent) mainContent.scrollTop = 0;

    renderLikedSongsTable();
}

// Callback for track playback triggered from table
let onPlayTrackCallback = null;
let currentPlayingIdx = 0;
let currentIsPlaying = false;

export function setLikedTablePlayHandler(handler) {
    onPlayTrackCallback = handler;
}

export function syncLikedTablePlayingState(trackIdx, isPlaying) {
    currentPlayingIdx = trackIdx;
    currentIsPlaying = isPlaying;

    const rows = document.querySelectorAll(".track-table-row");
    rows.forEach(row => {
        const rowIdx = parseInt(row.dataset.index, 10);
        const playIcon = row.querySelector(".row-play-icon");
        if (rowIdx === currentPlayingIdx && currentIsPlaying) {
            row.classList.add("playing");
            if (playIcon) playIcon.className = "fa-solid fa-pause row-play-icon";
        } else {
            row.classList.remove("playing");
            if (playIcon) playIcon.className = "fa-solid fa-play row-play-icon";
        }
    });

    // Update hero banner play button
    const heroPlayBtn = document.getElementById("play-all-liked-btn");
    if (heroPlayBtn) {
        const icon = heroPlayBtn.querySelector("i");
        const isCurrentInLiked = likedIndices.includes(currentPlayingIdx);
        if (icon) {
            icon.className = (isCurrentInLiked && currentIsPlaying) ? "fa-solid fa-pause" : "fa-solid fa-play";
        }
    }
}

/**
 * Render Liked Songs Table
 */
export function renderLikedSongsTable(filterText = "") {
    if (!likedTracksList) return;
    updateLibrarySidebarCount();

    if (likedIndices.length === 0) {
        if (emptyLikedState) emptyLikedState.style.display = "block";
        if (trackTableContainer) trackTableContainer.style.display = "none";
        return;
    }

    if (emptyLikedState) emptyLikedState.style.display = "none";
    if (trackTableContainer) trackTableContainer.style.display = "block";

    likedTracksList.innerHTML = "";

    const query = filterText.toLowerCase().trim();
    let displayCount = 0;

    likedIndices.forEach((trackIdx) => {
        const track = playlist[trackIdx];
        if (!track) return;

        if (query && !track.title.toLowerCase().includes(query) && !track.artist.toLowerCase().includes(query)) {
            return;
        }

        displayCount++;
        const isThisPlaying = (currentPlayingIdx === trackIdx && currentIsPlaying);

        const row = document.createElement("div");
        row.className = `track-table-row ${isThisPlaying ? "playing" : ""}`;
        row.dataset.index = trackIdx;

        row.innerHTML = `
            <div class="row-index">
                <span class="row-index-num">${displayCount}</span>
                <i class="fa-solid ${isThisPlaying ? 'fa-pause' : 'fa-play'} row-play-icon"></i>
            </div>
            <div class="row-title-cell">
                <img src="${track.img}" class="row-cover-img" alt="${track.title}">
                <div class="row-title-meta">
                    <span class="row-song-title">${track.title}</span>
                    <span class="row-song-artist">${track.artist}</span>
                </div>
            </div>
            <div class="row-album-cell">Spotify Singles</div>
            <div class="row-date-cell">Today</div>
            <button class="row-heart-btn" title="Remove from Liked Songs">
                <i class="fa-solid fa-heart"></i>
            </button>
            <div class="row-duration-cell">${track.duration}</div>
        `;

        // Click row to play
        row.addEventListener("click", (e) => {
            if (e.target.closest(".row-heart-btn")) return; // Don't trigger play on heart click
            if (onPlayTrackCallback) {
                onPlayTrackCallback(trackIdx);
            }
        });

        // Click heart button inside table to unlike
        const heartBtn = row.querySelector(".row-heart-btn");
        if (heartBtn) {
            heartBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                toggleLikeTrack(trackIdx);
            });
        }

        likedTracksList.appendChild(row);
    });
}

/**
 * Create a new custom playlist
 */
export function createNewPlaylist(name, description = "") {
    const trimmed = (name || "").trim() || `My Playlist #${userPlaylists.length + 1}`;
    const newPlaylist = {
        id: "pl_" + Date.now(),
        name: trimmed,
        description: description.trim(),
        createdAt: new Date().toLocaleDateString(),
        songs: []
    };

    userPlaylists.unshift(newPlaylist);
    try {
        localStorage.setItem(STORAGE_USER_PLAYLISTS, JSON.stringify(userPlaylists));
    } catch (e) {
        console.warn("Storage save error", e);
    }

    renderUserPlaylists();
    showToast(`Created playlist "${trimmed}"`, "spotify-green", "fa-solid fa-list-check");
    return newPlaylist;
}

/**
 * Render User Playlists in the Library Sidebar
 */
export function renderUserPlaylists() {
    if (!userPlaylistsList) return;
    userPlaylistsList.innerHTML = "";

    userPlaylists.forEach(pl => {
        const item = document.createElement("div");
        item.className = "library-item";
        item.dataset.id = pl.id;
        item.innerHTML = `
            <div class="playlist-icon-box">
                <i class="fa-solid fa-music"></i>
            </div>
            <div class="lib-item-info">
                <span class="lib-item-title">${pl.name}</span>
                <span class="lib-item-sub">Playlist • By You</span>
            </div>
        `;
        item.addEventListener("click", () => {
            showToast(`Opening playlist "${pl.name}"`, "spotify-dark", "fa-solid fa-music");
        });
        userPlaylistsList.appendChild(item);
    });
}

// Initial renders on module load
updateLibrarySidebarCount();
renderUserPlaylists();
