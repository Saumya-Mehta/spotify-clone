// Spotify Web Player - UI & Panels Controller
import { playlist, trackDetails, lyricsDatabase } from "./data.js";
import { showToast } from "./utils.js";

// DOM Elements - Panels & Overlays
const lyricsView = document.getElementById("lyrics-view");
const closeLyricsBtn = document.getElementById("close-lyrics-btn");
const lyricsSongTitle = document.getElementById("lyrics-song-title");
const lyricsArtistName = document.getElementById("lyrics-artist-name");
const lyricsContent = document.getElementById("lyrics-content");

const queueView = document.getElementById("queue-view");
const closeQueueBtn = document.getElementById("close-queue-btn");
const queueNowPlaying = document.getElementById("queue-now-playing");
const queueList = document.getElementById("queue-list");
const queueCount = document.getElementById("queue-count");

const nowPlayingView = document.getElementById("now-playing-view");
const closeNpBtn = document.getElementById("close-np-btn");
const npArtwork = document.getElementById("np-artwork");
const npTitle = document.getElementById("np-title");
const npArtist = document.getElementById("np-artist");
const npBio = document.getElementById("np-bio");
const npCreditsArtist = document.getElementById("np-credits-artist");

const deviceView = document.getElementById("device-view");
const closeDeviceBtn = document.getElementById("close-device-btn");
const deviceItems = document.querySelectorAll(".device-item");

const pipWidget = document.getElementById("pip-widget");
const closePipBtn = document.getElementById("close-pip-btn");
const pipImg = document.getElementById("pip-img");
const pipTitle = document.getElementById("pip-title");
const pipArtist = document.getElementById("pip-artist");
const pipPlayBtn = document.getElementById("pip-play-btn");

const lyricsBtn = document.getElementById("lyrics-btn");
const queueBtn = document.getElementById("queue-btn");
const nowPlayingBtn = document.getElementById("now-playing-btn");
const deviceBtn = document.getElementById("device-btn");
const pipBtn = document.getElementById("pip-btn");
const fullscreenBtn = document.getElementById("fullscreen-btn");
const likeBtn = document.getElementById("like-btn");
const volumeIcon = document.querySelector("#volume-icon-btn i");

const mainContainer = document.querySelector(".main");
const sidebarCollapseBtn = document.getElementById("sidebar-collapse-btn");
const sidebarExpandBtn = document.getElementById("sidebar-expand-btn");
const cards = document.querySelectorAll(".card");

/**
 * Close all slide-out side drawers and overlay panels
 */
export function closeAllPanels() {
    if (lyricsView) lyricsView.classList.remove("open");
    if (queueView) queueView.classList.remove("open");
    if (nowPlayingView) nowPlayingView.classList.remove("open");
    if (lyricsBtn) lyricsBtn.classList.remove("active");
    if (queueBtn) queueBtn.classList.remove("active");
    if (nowPlayingBtn) nowPlayingBtn.classList.remove("active");
}

/**
 * Render Lyrics Overlay
 */
export function renderLyrics(trackIndex, audio) {
    if (!lyricsContent) return;
    const lines = lyricsDatabase[trackIndex] || [
        "Lyrics are currently unavailable for this track.",
        "Enjoy the music!"
    ];
    lyricsContent.innerHTML = "";
    lines.forEach((line, idx) => {
        const p = document.createElement("p");
        p.className = `lyric-line ${idx === 0 ? "active" : ""}`;
        p.textContent = line;
        p.addEventListener("click", () => {
            document.querySelectorAll(".lyric-line").forEach(l => l.classList.remove("active"));
            p.classList.add("active");
            if (audio && !isNaN(audio.duration) && audio.duration > 0) {
                audio.currentTime = (idx / lines.length) * audio.duration;
            }
        });
        lyricsContent.appendChild(p);
    });

    if (lyricsSongTitle) lyricsSongTitle.textContent = playlist[trackIndex].title;
    if (lyricsArtistName) lyricsArtistName.textContent = playlist[trackIndex].artist;
    if (lyricsView && playlist[trackIndex].themeColor) {
        lyricsView.style.setProperty("--lyrics-bg", playlist[trackIndex].themeColor);
    }
}

export function toggleLyrics(currentTrackIndex, audio) {
    if (!lyricsView) return;
    const isOpen = lyricsView.classList.contains("open");
    if (isOpen) {
        lyricsView.classList.remove("open");
        if (lyricsBtn) lyricsBtn.classList.remove("active");
    } else {
        closeAllPanels();
        lyricsView.classList.add("open");
        if (lyricsBtn) lyricsBtn.classList.add("active");
        renderLyrics(currentTrackIndex, audio);
        showToast("Lyrics View", "spotify-green", "fa-solid fa-microphone");
    }
}

/**
 * Render Queue Drawer
 */
export function renderQueueView(currentTrackIndex, onTrackClick) {
    if (!queueNowPlaying || !queueList) return;
    const currentTrack = playlist[currentTrackIndex];

    queueNowPlaying.innerHTML = `
        <img src="${currentTrack.img}" alt="${currentTrack.title}">
        <div class="queue-item-info">
            <span class="queue-item-title" style="color:#1ed760;">${currentTrack.title}</span>
            <span class="queue-item-artist">${currentTrack.artist}</span>
        </div>
        <i class="fa-solid fa-volume-high" style="color:#1ed760; font-size:0.85rem;"></i>
    `;

    queueList.innerHTML = "";
    let count = 0;
    for (let i = 1; i < playlist.length; i++) {
        const nextIdx = (currentTrackIndex + i) % playlist.length;
        const nextTrack = playlist[nextIdx];
        count++;

        const item = document.createElement("div");
        item.className = "queue-item";
        item.innerHTML = `
            <span class="queue-item-idx">${count}</span>
            <img src="${nextTrack.img}" alt="${nextTrack.title}">
            <div class="queue-item-info">
                <span class="queue-item-title">${nextTrack.title}</span>
                <span class="queue-item-artist">${nextTrack.artist}</span>
            </div>
            <span class="queue-item-duration">${nextTrack.duration}</span>
        `;
        if (onTrackClick) {
            item.addEventListener("click", () => onTrackClick(nextIdx));
        }
        queueList.appendChild(item);
    }

    if (queueCount) queueCount.textContent = `${count} tracks`;
}

export function toggleQueue(currentTrackIndex, onTrackClick) {
    if (!queueView) return;
    const isOpen = queueView.classList.contains("open");
    if (isOpen) {
        queueView.classList.remove("open");
        if (queueBtn) queueBtn.classList.remove("active");
    } else {
        closeAllPanels();
        queueView.classList.add("open");
        if (queueBtn) queueBtn.classList.add("active");
        renderQueueView(currentTrackIndex, onTrackClick);
        showToast("Play Queue", "spotify-green", "fa-solid fa-list-ul");
    }
}

/**
 * Render Now Playing Drawer
 */
export function renderNowPlayingView(trackIndex) {
    const track = playlist[trackIndex];
    const details = trackDetails[trackIndex] || {
        bio: `${track.artist} is a popular artist featured on Spotify charts worldwide.`,
        credits: `${track.artist} • Universal / Sony / Warner Music`
    };

    if (npArtwork) npArtwork.src = track.img;
    if (npTitle) npTitle.textContent = track.title;
    if (npArtist) npArtist.textContent = track.artist;
    if (npBio) npBio.textContent = details.bio;
    if (npCreditsArtist) npCreditsArtist.textContent = details.credits;
}

export function toggleNowPlaying(currentTrackIndex) {
    if (!nowPlayingView) return;
    const isOpen = nowPlayingView.classList.contains("open");
    if (isOpen) {
        nowPlayingView.classList.remove("open");
        if (nowPlayingBtn) nowPlayingBtn.classList.remove("active");
    } else {
        closeAllPanels();
        nowPlayingView.classList.add("open");
        if (nowPlayingBtn) nowPlayingBtn.classList.add("active");
        renderNowPlayingView(currentTrackIndex);
        showToast("Now Playing View", "spotify-green", "fa-solid fa-bars-staggered");
    }
}

/**
 * Connect to Device Popover Toggle
 */
export function toggleDevice() {
    if (!deviceView) return;
    const isOpen = deviceView.classList.contains("show");
    if (isOpen) {
        deviceView.classList.remove("show");
        if (deviceBtn) deviceBtn.classList.remove("active");
    } else {
        deviceView.classList.add("show");
        if (deviceBtn) deviceBtn.classList.add("active");
    }
}

/**
 * Picture-in-Picture Mini Player
 */
export function renderPiP(trackIndex, isPlaying) {
    const track = playlist[trackIndex];
    if (pipImg) pipImg.src = track.img;
    if (pipTitle) pipTitle.textContent = track.title;
    if (pipArtist) pipArtist.textContent = track.artist;
    updatePiPPlayIcon(isPlaying);
}

export function updatePiPPlayIcon(isPlaying) {
    if (!pipPlayBtn) return;
    const icon = pipPlayBtn.querySelector("i");
    if (!icon) return;
    icon.className = isPlaying ? "fa-solid fa-pause" : "fa-solid fa-play";
}

export function togglePiP(currentTrackIndex, isPlaying) {
    if (!pipWidget) return;
    const isOpen = pipWidget.classList.contains("show");
    if (isOpen) {
        pipWidget.classList.remove("show");
        if (pipBtn) pipBtn.classList.remove("active");
    } else {
        pipWidget.classList.add("show");
        if (pipBtn) pipBtn.classList.add("active");
        renderPiP(currentTrackIndex, isPlaying);
        showToast("Mini Player", "spotify-green", "fa-solid fa-music");
    }
}

/**
 * Fullscreen Mode Toggle
 */
export function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
            showToast("Full Screen On", "spotify-green", "fa-solid fa-expand");
        }).catch(err => {
            console.log("Fullscreen request caught:", err);
            showToast("Fullscreen unavailable", "spotify-dark", "fa-solid fa-circle-exclamation");
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen().then(() => {
                showToast("Full Screen Off", "spotify-dark", "fa-solid fa-compress");
            });
        }
    }
}

/**
 * Like Button (Heart) UI Update
 */
export function updateLikeButtonUI(isLiked) {
    if (!likeBtn) return;
    const icon = likeBtn.querySelector("i");
    if (!icon) return;
    if (isLiked) {
        icon.className = "fa-solid fa-heart";
        likeBtn.classList.add("active");
    } else {
        icon.className = "fa-regular fa-heart";
        likeBtn.classList.remove("active");
    }
}

/**
 * Sidebar Collapse & Expand
 */
export function collapseSidebar() {
    if (!mainContainer) return;
    mainContainer.classList.add("sidebar-collapsed");
    if (sidebarCollapseBtn) {
        sidebarCollapseBtn.classList.add("disabled");
        sidebarCollapseBtn.title = "Sidebar hidden - Click > to restore";
    }
    if (sidebarExpandBtn) {
        sidebarExpandBtn.classList.remove("disabled");
        sidebarExpandBtn.classList.add("highlight");
        sidebarExpandBtn.title = "Show sidebar (>)";
    }
    showToast("Sidebar hidden", "spotify-dark", "fa-solid fa-chevron-left");
}

export function expandSidebar() {
    if (!mainContainer) return;
    mainContainer.classList.remove("sidebar-collapsed");
    if (sidebarCollapseBtn) {
        sidebarCollapseBtn.classList.remove("disabled");
        sidebarCollapseBtn.title = "Hide sidebar (<)";
    }
    if (sidebarExpandBtn) {
        sidebarExpandBtn.classList.add("disabled");
        sidebarExpandBtn.classList.remove("highlight");
        sidebarExpandBtn.title = "Sidebar visible";
    }
    showToast("Sidebar shown", "spotify-green", "fa-solid fa-chevron-right");
}

/**
 * Update Card Play/Pause Icons to match active track
 */
export function updateCardPlayIcons(currentTrackIndex, isPlaying) {
    cards.forEach((card, idx) => {
        const playBtn = card.querySelector(".play-btn i");
        if (!playBtn) return;
        const cardTrackIndex = idx + 1;
        if (cardTrackIndex === currentTrackIndex && isPlaying) {
            playBtn.classList.remove("fa-play");
            playBtn.classList.add("fa-pause");
        } else {
            playBtn.classList.remove("fa-pause");
            playBtn.classList.add("fa-play");
        }
    });
}

/**
 * Update volume icon (mute, low, high)
 */
export function updateVolumeIcon(vol) {
    if (!volumeIcon) return;
    volumeIcon.className = "";
    if (vol === 0) {
        volumeIcon.className = "fa-solid fa-volume-xmark";
    } else if (vol < 0.5) {
        volumeIcon.className = "fa-solid fa-volume-low";
    } else {
        volumeIcon.className = "fa-solid fa-volume-high";
    }
}

// Sync fullscreen button icon
document.addEventListener("fullscreenchange", () => {
    if (!fullscreenBtn) return;
    const icon = fullscreenBtn.querySelector("i");
    if (!icon) return;
    if (document.fullscreenElement) {
        icon.className = "fa-solid fa-down-left-and-up-right-to-center";
        fullscreenBtn.classList.add("active");
    } else {
        icon.className = "fa-solid fa-up-right-and-down-left-from-center";
        fullscreenBtn.classList.remove("active");
    }
});
