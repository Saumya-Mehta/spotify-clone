// Spotify Web Player - Audio Engine & Playback Pipeline
import { playlist } from "./data.js";
import { formatTime, showToast } from "./utils.js";

export const audio = new Audio();
audio.src = playlist[0].audio;
audio.volume = 0.7;

export let currentTrackIndex = 0;
export let isPlaying = false;
export let isShuffle = false;
export let isRepeat = false;
export let previousVolume = 0.7;

// DOM Elements - Main Player Controls
const currentAlbumImg = document.getElementById("current-album-img");
const currentSongTitle = document.getElementById("current-song-title");
const currentArtistName = document.getElementById("current-artist-name");
const totalTimeDisplay = document.getElementById("total-time");
const currentTimeDisplay = document.getElementById("current-time");
const trackSlider = document.getElementById("track-slider");
const volumeSlider = document.getElementById("volume-slider");
const playPauseBtn = document.getElementById("play-pause-btn");
const playPauseIcon = playPauseBtn ? playPauseBtn.querySelector("i") : null;
const equalizer = document.getElementById("equalizer");
const mainContent = document.querySelector(".main-content");
const shuffleBtn = document.getElementById("shuffle-btn");
const repeatBtn = document.getElementById("repeat-btn");

// UI Synchronization Callback
let onStateChangeCallback = null;

export function setOnStateChange(cb) {
    onStateChangeCallback = cb;
}

function notifyStateChange() {
    if (onStateChangeCallback) {
        onStateChangeCallback(currentTrackIndex, isPlaying);
    }
}

/**
 * Update MediaSession API for OS media controls, lock screen, and physical media keys
 */
export function updateMediaSession(track) {
    if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title,
            artist: track.artist,
            album: "Spotify Clone",
            artwork: [
                { src: track.img, sizes: "300x300", type: "image/jpeg" },
                { src: track.img, sizes: "512x512", type: "image/jpeg" }
            ]
        });
    }
}

/**
 * Load a track by index
 */
export function loadTrack(index) {
    if (index < 0 || index >= playlist.length) index = 0;
    currentTrackIndex = index;
    const track = playlist[currentTrackIndex];

    audio.src = track.audio;
    if (currentAlbumImg) currentAlbumImg.src = track.img;
    if (currentSongTitle) currentSongTitle.textContent = track.title;
    if (currentArtistName) currentArtistName.textContent = track.artist;
    if (totalTimeDisplay) totalTimeDisplay.textContent = track.duration;
    if (trackSlider) {
        trackSlider.value = 0;
        trackSlider.style.setProperty("--progress", "0%");
    }
    if (currentTimeDisplay) currentTimeDisplay.textContent = "00:00";

    // Dynamic Ambient Glow
    if (mainContent && track.themeColor) {
        mainContent.style.setProperty("--ambient-glow", track.themeColor);
    }

    updateMediaSession(track);
    notifyStateChange();
}

/**
 * Play current track
 */
export function playTrack() {
    audio.play().then(() => {
        isPlaying = true;
        if (playPauseIcon) {
            playPauseIcon.classList.remove("fa-play");
            playPauseIcon.classList.add("fa-pause");
        }
        if (equalizer) equalizer.classList.add("active");
        if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
        notifyStateChange();
    }).catch(err => {
        console.log("Audio play caught, using fallback synthesizer:", err);
        startSynthPlayback();
    });
}

/**
 * Pause current track
 */
export function pauseTrack() {
    audio.pause();
    stopSynthPlayback();
    isPlaying = false;
    if (playPauseIcon) {
        playPauseIcon.classList.remove("fa-pause");
        playPauseIcon.classList.add("fa-play");
    }
    if (equalizer) equalizer.classList.remove("active");
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
    notifyStateChange();
}

/**
 * Toggle Play/Pause
 */
export function togglePlayPause() {
    if (isPlaying) {
        pauseTrack();
        showToast("Paused", "spotify-dark", "fa-solid fa-pause");
    } else {
        playTrack();
        showToast("Playing", "spotify-green", "fa-solid fa-play");
    }
}

/**
 * Next Track
 */
export function nextTrack() {
    if (isShuffle) {
        currentTrackIndex = Math.floor(Math.random() * playlist.length);
    } else {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    }
    loadTrack(currentTrackIndex);
    playTrack();
}

/**
 * Previous Track
 */
export function prevTrack() {
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
    }
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrackIndex);
    playTrack();
}

/**
 * Toggle Mute
 */
export function toggleMute(updateVolumeIcon) {
    if (audio.volume > 0) {
        previousVolume = audio.volume;
        audio.volume = 0;
        if (volumeSlider) {
            volumeSlider.value = 0;
            volumeSlider.style.setProperty("--progress", "0%");
        }
        if (updateVolumeIcon) updateVolumeIcon(0);
        showToast("Muted", "spotify-dark", "fa-solid fa-volume-xmark");
    } else {
        audio.volume = previousVolume || 0.7;
        const percent = audio.volume * 100;
        if (volumeSlider) {
            volumeSlider.value = percent;
            volumeSlider.style.setProperty("--progress", `${percent}%`);
        }
        if (updateVolumeIcon) updateVolumeIcon(audio.volume);
        showToast("Unmuted", "spotify-dark", "fa-solid fa-volume-high");
    }
}

/**
 * Toggle Shuffle
 */
export function toggleShuffle() {
    isShuffle = !isShuffle;
    if (shuffleBtn) shuffleBtn.classList.toggle("active", isShuffle);
    showToast(isShuffle ? "Shuffle on" : "Shuffle off", "spotify-dark", "fa-solid fa-shuffle");
}

/**
 * Toggle Repeat
 */
export function toggleRepeat() {
    isRepeat = !isRepeat;
    if (repeatBtn) repeatBtn.classList.toggle("active", isRepeat);
    showToast(isRepeat ? "Repeat track on" : "Repeat off", "spotify-dark", "fa-solid fa-repeat");
}

/**
 * Auto-detect exact duration when audio metadata loads
 */
audio.addEventListener("loadedmetadata", () => {
    if (!isNaN(audio.duration) && audio.duration > 0 && totalTimeDisplay) {
        totalTimeDisplay.textContent = formatTime(audio.duration);
    }
});

/**
 * Track finished playback
 */
audio.addEventListener("ended", () => {
    if (isRepeat) {
        audio.currentTime = 0;
        playTrack();
    } else {
        nextTrack();
    }
});

// Offline / Fallback Web Audio Synthesizer
let audioCtx = null;
let synthInterval = null;

export function startSynthPlayback() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }
        isPlaying = true;
        if (playPauseIcon) {
            playPauseIcon.classList.remove("fa-play");
            playPauseIcon.classList.add("fa-pause");
        }
        if (equalizer) equalizer.classList.add("active");
        notifyStateChange();

        const notes = [261.63, 329.63, 392.00, 523.25, 440.00, 349.23];
        let step = 0;
        let currentSec = 0;

        if (synthInterval) clearInterval(synthInterval);
        synthInterval = setInterval(() => {
            if (!isPlaying) return;
            currentSec += 0.5;
            if (trackSlider) {
                const val = (currentSec % 180) / 1.8;
                trackSlider.value = val;
                trackSlider.style.setProperty("--progress", `${val}%`);
            }
            if (currentTimeDisplay) currentTimeDisplay.textContent = formatTime(currentSec);

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const note = notes[step % notes.length];
            step++;

            osc.type = "sine";
            osc.frequency.setValueAtTime(note, audioCtx.currentTime);
            gain.gain.setValueAtTime(audio.volume * 0.15, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.4);
        }, 500);
    } catch (e) {
        console.warn("Web audio synth note:", e);
    }
}

export function stopSynthPlayback() {
    if (synthInterval) {
        clearInterval(synthInterval);
        synthInterval = null;
    }
}

// MediaSession Handlers
if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("play", () => playTrack());
    navigator.mediaSession.setActionHandler("pause", () => pauseTrack());
    navigator.mediaSession.setActionHandler("previoustrack", () => prevTrack());
    navigator.mediaSession.setActionHandler("nexttrack", () => nextTrack());
    try {
        navigator.mediaSession.setActionHandler("seekto", (details) => {
            if (details.seekTime && !isNaN(audio.duration)) {
                audio.currentTime = details.seekTime;
            }
        });
    } catch (e) {
        console.log("seekto action handler not supported in this browser version", e);
    }
}
