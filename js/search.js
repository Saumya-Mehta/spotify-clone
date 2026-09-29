// Spotify Web Player - Search Engine & View Navigation
import { playlist } from "./data.js";
import { escapeHtml } from "./utils.js";

const navHomeBtn = document.getElementById("nav-home-btn");
const homeView = document.getElementById("home-view");
const searchView = document.getElementById("search-view");
const searchInput = document.getElementById("spotify-search-input");
const clearSearchBtn = document.getElementById("clear-search-btn");
const searchResultsSection = document.getElementById("search-results-section");
const browseAllSection = document.getElementById("browse-all-section");
const mainContent = document.querySelector(".main-content");

export function showHomeView() {
    const likedSongsView = document.getElementById("liked-songs-view");
    const libLikedSongsBtn = document.getElementById("lib-liked-songs-btn");
    const mobHome = document.getElementById("mobile-nav-home");
    const mobItems = document.querySelectorAll(".mobile-nav-item");
    if (mobItems.length) mobItems.forEach(m => m.classList.remove("active"));
    if (mobHome) mobHome.classList.add("active");

    if (navHomeBtn) navHomeBtn.classList.add("active");
    if (libLikedSongsBtn) libLikedSongsBtn.classList.remove("active");
    if (homeView) homeView.style.display = "block";
    if (searchView) searchView.style.display = "none";
    if (likedSongsView) likedSongsView.style.display = "none";
    if (mainContent) mainContent.scrollTop = 0;
}

export function showSearchView(focusInput = true) {
    const likedSongsView = document.getElementById("liked-songs-view");
    const libLikedSongsBtn = document.getElementById("lib-liked-songs-btn");
    const mobSearch = document.getElementById("mobile-nav-search");
    const mobItems = document.querySelectorAll(".mobile-nav-item");
    if (mobItems.length) mobItems.forEach(m => m.classList.remove("active"));
    if (mobSearch) mobSearch.classList.add("active");

    if (navHomeBtn) navHomeBtn.classList.remove("active");
    if (libLikedSongsBtn) libLikedSongsBtn.classList.remove("active");
    if (homeView) homeView.style.display = "none";
    if (likedSongsView) likedSongsView.style.display = "none";
    if (searchView) searchView.style.display = "block";
    if (focusInput && searchInput) {
        searchInput.focus();
        searchInput.select();
    }
    if (mainContent) mainContent.scrollTop = 0;
}

export function updateSearchPlayIcons(currentTrackIndex, isPlaying) {
    const topPlayBtn = document.getElementById("top-play-btn");
    const currentTopCard = document.getElementById("top-result-card");
    if (topPlayBtn && currentTopCard) {
        const icon = topPlayBtn.querySelector("i");
        const topCardTrackIndex = currentTopCard.dataset.trackIndex !== undefined ? parseInt(currentTopCard.dataset.trackIndex, 10) : -1;
        if (topCardTrackIndex === currentTrackIndex && isPlaying) {
            if (icon) icon.className = "fa-solid fa-pause";
            topPlayBtn.classList.add("active");
        } else {
            if (icon) icon.className = "fa-solid fa-play";
            topPlayBtn.classList.remove("active");
        }
    }

    const songRows = document.querySelectorAll(".search-song-row");
    songRows.forEach(row => {
        const rowIdx = parseInt(row.dataset.index, 10);
        if (rowIdx === currentTrackIndex && isPlaying) {
            row.classList.add("playing");
        } else {
            row.classList.remove("playing");
        }
    });
}

export function executeSearch(query, currentTrackIndex, isPlaying, onTrackClick) {
    const cleanQuery = (query || "").trim().toLowerCase();

    if (!cleanQuery) {
        if (clearSearchBtn) clearSearchBtn.style.display = "none";
        if (browseAllSection) browseAllSection.style.display = "block";
        if (searchResultsSection) searchResultsSection.style.display = "none";
        return;
    }

    if (clearSearchBtn) clearSearchBtn.style.display = "block";
    if (browseAllSection) browseAllSection.style.display = "none";
    if (searchResultsSection) searchResultsSection.style.display = "block";

    const matches = [];
    playlist.forEach((track, index) => {
        const titleMatch = track.title.toLowerCase().includes(cleanQuery);
        const artistMatch = track.artist.toLowerCase().includes(cleanQuery);
        const genreMatch = track.genre ? track.genre.toLowerCase().includes(cleanQuery) : false;

        if (titleMatch || artistMatch || genreMatch) {
            let score = 0;
            if (titleMatch) score += 4;
            if (artistMatch) score += 2;
            if (genreMatch) score += 1;
            matches.push({ ...track, originalIndex: index, score });
        }
    });

    matches.sort((a, b) => b.score - a.score);

    if (matches.length === 0) {
        searchResultsSection.innerHTML = `
            <div class="no-search-results">
                <h3>No results found for "${escapeHtml(query)}"</h3>
                <p>Please make sure your words are spelled correctly, or try searching for <em>Daylight</em>, <em>Arijit</em>, <em>Darshan</em>, <em>The Weeknd</em>, <em>Harry Styles</em>, or genres like <em>Pop</em>, <em>Bollywood</em>, <em>Indie</em>, or <em>Punjabi</em>.</p>
            </div>
        `;
        return;
    }

    searchResultsSection.innerHTML = `
        <div class="search-results-grid">
            <div class="top-result-col">
                <h3>Top result</h3>
                <div class="top-result-card" id="top-result-card"></div>
            </div>
            <div class="songs-result-col">
                <h3>Songs</h3>
                <div class="songs-result-list" id="songs-result-list"></div>
            </div>
        </div>
    `;

    const newTopCard = document.getElementById("top-result-card");
    const newSongsList = document.getElementById("songs-result-list");

    const topMatch = matches[0];
    const isTopPlaying = (currentTrackIndex === topMatch.originalIndex && isPlaying);

    if (newTopCard) {
        newTopCard.dataset.trackIndex = topMatch.originalIndex;
        newTopCard.innerHTML = `
            <img src="${topMatch.img}" alt="${escapeHtml(topMatch.title)}">
            <h2 class="top-result-title">${escapeHtml(topMatch.title)}</h2>
            <div class="top-result-meta">
                <span class="top-result-artist">${escapeHtml(topMatch.artist)}</span>
                <span class="top-result-tag">Song</span>
            </div>
            <button class="top-result-play-btn ${isTopPlaying ? 'active' : ''}" id="top-play-btn" title="Play">
                <i class="fa-solid ${isTopPlaying ? 'fa-pause' : 'fa-play'}"></i>
            </button>
        `;

        newTopCard.addEventListener("click", () => {
            if (onTrackClick) onTrackClick(topMatch.originalIndex);
        });
    }

    if (newSongsList) {
        newSongsList.innerHTML = "";
        const displaySongs = matches.slice(0, 5);
        displaySongs.forEach((song) => {
            const isThisPlaying = (currentTrackIndex === song.originalIndex && isPlaying);
            const row = document.createElement("div");
            row.className = `search-song-row ${isThisPlaying ? 'playing' : ''}`;
            row.dataset.index = song.originalIndex;
            row.innerHTML = `
                <img src="${song.img}" alt="${escapeHtml(song.title)}">
                <div class="search-song-info">
                    <span class="search-song-title">${escapeHtml(song.title)}</span>
                    <span class="search-song-artist">${escapeHtml(song.artist)}</span>
                </div>
                <span class="search-song-duration">${song.duration}</span>
            `;

            row.addEventListener("click", (e) => {
                e.stopPropagation();
                if (onTrackClick) onTrackClick(song.originalIndex);
            });

            newSongsList.appendChild(row);
        });
    }
}
