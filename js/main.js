// Spotify Web Player - Modular Master Entry Point (js/main.js)
import { playlist } from "./data.js";
import { formatTime, showToast } from "./utils.js";
import {
    audio,
    currentTrackIndex,
    isPlaying,
    loadTrack,
    playTrack,
    pauseTrack,
    togglePlayPause,
    nextTrack,
    prevTrack,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    setOnStateChange
} from "./audioEngine.js";
import {
    closeAllPanels,
    renderLyrics,
    toggleLyrics,
    renderQueueView,
    toggleQueue,
    renderNowPlayingView,
    toggleNowPlaying,
    toggleDevice,
    renderPiP,
    togglePiP,
    toggleFullscreen,
    updateLikeButtonUI,
    collapseSidebar,
    expandSidebar,
    updateCardPlayIcons,
    updateVolumeIcon
} from "./ui.js";
import {
    showHomeView,
    showSearchView,
    executeSearch,
    updateSearchPlayIcons
} from "./search.js";
import {
    isTrackLiked,
    getLikedIndices,
    toggleLikeTrack,
    updateLibrarySidebarCount,
    showLikedSongsView,
    setLikedTablePlayHandler,
    syncLikedTablePlayingState,
    renderLikedSongsTable,
    createNewPlaylist
} from "./library.js";
import {
    openCreatePlaylistModal,
    openPremiumModal,
    openInstallAppModal,
    toggleProfilePopover,
    openLanguageModal,
    openLegalModal
} from "./modals.js";
import { initAuthListeners } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements - Player Core
    const playPauseBtn = document.getElementById("play-pause-btn");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const shuffleBtn = document.getElementById("shuffle-btn");
    const repeatBtn = document.getElementById("repeat-btn");
    const likeBtn = document.getElementById("like-btn");
    const trackSlider = document.getElementById("track-slider");
    const currentTimeDisplay = document.getElementById("current-time");
    const totalTimeDisplay = document.getElementById("total-time");
    const volumeSlider = document.getElementById("volume-slider");
    const volumeIconBtn = document.getElementById("volume-icon-btn");

    // DOM Elements - Utility & Overlay Buttons
    const lyricsBtn = document.getElementById("lyrics-btn");
    const closeLyricsBtn = document.getElementById("close-lyrics-btn");
    const queueBtn = document.getElementById("queue-btn");
    const closeQueueBtn = document.getElementById("close-queue-btn");
    const nowPlayingBtn = document.getElementById("now-playing-btn");
    const closeNpBtn = document.getElementById("close-np-btn");
    const deviceBtn = document.getElementById("device-btn");
    const closeDeviceBtn = document.getElementById("close-device-btn");
    const pipBtn = document.getElementById("pip-btn");
    const closePipBtn = document.getElementById("close-pip-btn");
    const fullscreenBtn = document.getElementById("fullscreen-btn");
    const pipPlayBtn = document.getElementById("pip-play-btn");
    const pipPrevBtn = document.getElementById("pip-prev-btn");
    const pipNextBtn = document.getElementById("pip-next-btn");

    // DOM Elements - Sidebar & Views
    const sidebarCollapseBtn = document.getElementById("sidebar-collapse-btn");
    const sidebarExpandBtn = document.getElementById("sidebar-expand-btn");
    const navHomeBtn = document.getElementById("nav-home-btn");
    const logoBtn = document.querySelector(".nav .logo");
    const searchInput = document.getElementById("spotify-search-input");
    const clearSearchBtn = document.getElementById("clear-search-btn");
    const browseTiles = document.querySelectorAll(".browse-tile");
    const cards = document.querySelectorAll(".card");
    const categoryChips = document.querySelectorAll(".chip");
    const deviceItems = document.querySelectorAll(".device-item");
    const mainContent = document.querySelector(".main-content");
    const lyricsView = document.getElementById("lyrics-view");
    const lyricsContent = document.getElementById("lyrics-content");
    const deviceView = document.getElementById("device-view");
    const pipWidget = document.getElementById("pip-widget");

    // DOM Elements - Library & Liked Songs
    const libLikedSongsBtn = document.getElementById("lib-liked-songs-btn");
    const sidebarLibraryBtn = document.getElementById("sidebar-library-btn");
    const sidebarCreatePlaylistBtn = document.getElementById("sidebar-create-playlist-btn");
    const sidebarExpandWidthBtn = document.getElementById("sidebar-expand-width-btn");
    const createPlaylistPromptBtn = document.getElementById("create-playlist-box-btn");
    const browsePodcastsPromptBtn = document.getElementById("browse-podcasts-box-btn");
    const libPills = document.querySelectorAll(".lib-pill");
    const playAllLikedBtn = document.getElementById("play-all-liked-btn");
    const likedDownloadBtn = document.getElementById("liked-download-btn");
    const filterLikedInput = document.getElementById("filter-liked-input");
    const findSongsBtn = document.getElementById("find-songs-btn");

    // DOM Elements - Header Options & Modals
    const explorePremiumBtn = document.getElementById("explore-premium-btn");
    const installAppBtn = document.getElementById("install-app-btn");
    const userAvatarBtn = document.getElementById("user-avatar-btn");
    const sidebarLangBtn = document.getElementById("sidebar-lang-btn");
    const footerLinks = document.querySelectorAll(".footer-link");
    const closeLegalFooterBtn = document.getElementById("close-legal-footer-btn");
    const showAllLinks = document.querySelectorAll(".show-all");
    const mainFooterLinks = document.querySelectorAll(".main-footer a");

    // Initialize visual sliders
    if (trackSlider) trackSlider.style.setProperty("--progress", "0%");
    if (volumeSlider) volumeSlider.style.setProperty("--progress", "70%");

    // Wire up centralized UI state synchronization
    setOnStateChange((trackIdx, isPlayingState) => {
        updateCardPlayIcons(trackIdx, isPlayingState);
        updateSearchPlayIcons(trackIdx, isPlayingState);
        renderLyrics(trackIdx, audio);
        renderNowPlayingView(trackIdx);
        renderQueueView(trackIdx, (newIdx) => {
            loadTrack(newIdx);
            playTrack();
        });
        renderPiP(trackIdx, isPlayingState);
        syncLikedTablePlayingState(trackIdx, isPlayingState);
        updateLikeButtonUI(isTrackLiked(trackIdx));
    });

    // 1. Playbar Transport Buttons
    if (playPauseBtn) playPauseBtn.addEventListener("click", togglePlayPause);
    if (nextBtn) nextBtn.addEventListener("click", nextTrack);
    if (prevBtn) prevBtn.addEventListener("click", prevTrack);
    if (shuffleBtn) shuffleBtn.addEventListener("click", toggleShuffle);
    if (repeatBtn) repeatBtn.addEventListener("click", toggleRepeat);

    // Like Button with LocalStorage and UI state sync
    function handleLikeToggle() {
        toggleLikeTrack(currentTrackIndex, (nowLiked) => {
            updateLikeButtonUI(nowLiked);
        });
    }
    if (likeBtn) likeBtn.addEventListener("click", handleLikeToggle);

    // 2. Timeline Progress Bar (timeupdate)
    audio.addEventListener("timeupdate", () => {
        if (!isNaN(audio.duration) && audio.duration > 0) {
            const progressPercent = (audio.currentTime / audio.duration) * 100;
            if (trackSlider) {
                trackSlider.value = progressPercent;
                trackSlider.style.setProperty("--progress", `${progressPercent}%`);
            }
            if (currentTimeDisplay) currentTimeDisplay.textContent = formatTime(audio.currentTime);
            if (totalTimeDisplay) totalTimeDisplay.textContent = formatTime(audio.duration);

            // Synchronize active lyric line highlight
            if (lyricsView && lyricsView.classList.contains("open") && lyricsContent) {
                const lyricLines = lyricsContent.querySelectorAll(".lyric-line");
                if (lyricLines.length > 0) {
                    const activeIndex = Math.min(
                        lyricLines.length - 1,
                        Math.floor((audio.currentTime / audio.duration) * lyricLines.length)
                    );
                    lyricLines.forEach((l, i) => {
                        if (i === activeIndex) {
                            l.classList.add("active");
                        } else {
                            l.classList.remove("active");
                        }
                    });
                }
            }
        }
    });

    // Timeline Scrubbing
    if (trackSlider) {
        trackSlider.addEventListener("input", (e) => {
            if (!isNaN(audio.duration)) {
                const seekTo = (e.target.value / 100) * audio.duration;
                audio.currentTime = seekTo;
                trackSlider.style.setProperty("--progress", `${e.target.value}%`);
                if (currentTimeDisplay) currentTimeDisplay.textContent = formatTime(seekTo);
            }
        });
    }

    // Volume Slider & Mute
    if (volumeSlider) {
        volumeSlider.addEventListener("input", (e) => {
            const vol = e.target.value / 100;
            audio.volume = vol;
            volumeSlider.style.setProperty("--progress", `${e.target.value}%`);
            updateVolumeIcon(vol);
        });
    }

    if (volumeIconBtn) {
        volumeIconBtn.addEventListener("click", () => toggleMute(updateVolumeIcon));
    }

    // 3. Playbar Utility Overlays
    if (lyricsBtn) lyricsBtn.addEventListener("click", () => toggleLyrics(currentTrackIndex, audio));
    if (closeLyricsBtn) closeLyricsBtn.addEventListener("click", () => toggleLyrics(currentTrackIndex, audio));

    if (queueBtn) queueBtn.addEventListener("click", () => toggleQueue(currentTrackIndex, (newIdx) => {
        loadTrack(newIdx);
        playTrack();
    }));
    if (closeQueueBtn) closeQueueBtn.addEventListener("click", () => toggleQueue(currentTrackIndex));

    if (nowPlayingBtn) nowPlayingBtn.addEventListener("click", () => toggleNowPlaying(currentTrackIndex));
    if (closeNpBtn) closeNpBtn.addEventListener("click", () => toggleNowPlaying(currentTrackIndex));

    if (deviceBtn) deviceBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleDevice();
    });
    if (closeDeviceBtn) closeDeviceBtn.addEventListener("click", toggleDevice);

    if (pipBtn) pipBtn.addEventListener("click", () => togglePiP(currentTrackIndex, isPlaying));
    if (closePipBtn) closePipBtn.addEventListener("click", () => togglePiP(currentTrackIndex, isPlaying));
    if (fullscreenBtn) fullscreenBtn.addEventListener("click", toggleFullscreen);

    // Mini Player (PiP) Transport Buttons
    if (pipPlayBtn) pipPlayBtn.addEventListener("click", togglePlayPause);
    if (pipPrevBtn) pipPrevBtn.addEventListener("click", prevTrack);
    if (pipNextBtn) pipNextBtn.addEventListener("click", nextTrack);

    // 4. Sidebar Hide / Show Buttons
    if (sidebarCollapseBtn) sidebarCollapseBtn.addEventListener("click", () => {
        const main = document.querySelector(".main");
        if (main && main.classList.contains("sidebar-collapsed")) {
            expandSidebar();
        } else {
            collapseSidebar();
        }
    });

    if (sidebarExpandBtn) sidebarExpandBtn.addEventListener("click", () => {
        const main = document.querySelector(".main");
        if (main && main.classList.contains("sidebar-collapsed")) {
            expandSidebar();
        } else {
            collapseSidebar();
        }
    });

    // 5. Sidebar Navigation (Home)
    if (navHomeBtn) {
        navHomeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            showHomeView();
        });
    }

    if (logoBtn) {
        logoBtn.style.cursor = "pointer";
        logoBtn.addEventListener("click", showHomeView);
    }

    // 6. Dedicated Liked Songs View & Library Handlers
    if (libLikedSongsBtn) {
        libLikedSongsBtn.addEventListener("click", () => {
            showLikedSongsView();
        });
    }

    if (sidebarLibraryBtn) {
        sidebarLibraryBtn.addEventListener("click", (e) => {
            e.preventDefault();
            showLikedSongsView();
        });
    }

    // Play all Liked Songs
    if (playAllLikedBtn) {
        playAllLikedBtn.addEventListener("click", () => {
            const liked = getLikedIndices();
            if (liked.length > 0) {
                if (liked.includes(currentTrackIndex)) {
                    togglePlayPause();
                } else {
                    loadTrack(liked[0]);
                    playTrack();
                }
            } else {
                showToast("No liked songs yet! Click the heart on any track.", "spotify-dark", "fa-regular fa-heart");
            }
        });
    }

    // Table click callback to play songs
    setLikedTablePlayHandler((chosenIdx) => {
        if (currentTrackIndex === chosenIdx) {
            togglePlayPause();
        } else {
            loadTrack(chosenIdx);
            playTrack();
        }
    });

    // Search / Filter within Liked Songs
    if (filterLikedInput) {
        filterLikedInput.addEventListener("input", (e) => {
            renderLikedSongsTable(e.target.value);
        });
    }

    // Liked Songs download simulation
    if (likedDownloadBtn) {
        likedDownloadBtn.addEventListener("click", () => {
            showToast("Liked Songs downloaded for offline listening", "spotify-green", "fa-solid fa-circle-down");
        });
    }

    // Find songs button in empty state
    if (findSongsBtn) {
        findSongsBtn.addEventListener("click", () => {
            showSearchView(true);
        });
    }

    // 7. Modals & Popovers Interactions
    if (sidebarCreatePlaylistBtn) sidebarCreatePlaylistBtn.addEventListener("click", openCreatePlaylistModal);
    if (createPlaylistPromptBtn) createPlaylistPromptBtn.addEventListener("click", openCreatePlaylistModal);

    if (sidebarExpandWidthBtn) {
        sidebarExpandWidthBtn.addEventListener("click", () => {
            const sidebar = document.querySelector(".sidebar");
            if (sidebar) {
                sidebar.classList.toggle("expanded-width");
                const isExp = sidebar.classList.contains("expanded-width");
                showToast(isExp ? "Expanded library view" : "Standard library view", "spotify-dark", "fa-solid fa-arrows-left-right");
            }
        });
    }

    if (browsePodcastsPromptBtn) {
        browsePodcastsPromptBtn.addEventListener("click", () => {
            if (searchInput) searchInput.value = "Podcast";
            showSearchView(false);
            runSearch("Podcast");
        });
    }

    // Library Pills Filtering
    libPills.forEach(pill => {
        pill.addEventListener("click", () => {
            libPills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            const type = pill.dataset.type;
            const likedItem = document.getElementById("lib-liked-songs-btn");
            const plBox = document.getElementById("create-playlist-box");
            const podBox = document.getElementById("browse-podcasts-box");
            const userPlList = document.getElementById("user-playlists-list");

            if (type === "all") {
                if (likedItem) likedItem.style.display = "flex";
                if (plBox) plBox.style.display = "block";
                if (podBox) podBox.style.display = "block";
                if (userPlList) userPlList.style.display = "block";
            } else if (type === "playlists") {
                if (likedItem) likedItem.style.display = "flex";
                if (plBox) plBox.style.display = "block";
                if (podBox) podBox.style.display = "none";
                if (userPlList) userPlList.style.display = "block";
            } else if (type === "podcasts") {
                if (likedItem) likedItem.style.display = "none";
                if (plBox) plBox.style.display = "none";
                if (podBox) podBox.style.display = "block";
                if (userPlList) userPlList.style.display = "none";
            }
            showToast(`Library: ${pill.textContent}`, "spotify-dark", "fa-solid fa-filter");
        });
    });

    // Top Header Buttons
    if (explorePremiumBtn) explorePremiumBtn.addEventListener("click", openPremiumModal);
    if (installAppBtn) installAppBtn.addEventListener("click", openInstallAppModal);
    if (userAvatarBtn) {
        userAvatarBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleProfilePopover();
        });
    }

    // Sidebar Language Modal
    if (sidebarLangBtn) sidebarLangBtn.addEventListener("click", openLanguageModal);

    // Sidebar Footer Legal Links
    footerLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const tab = link.dataset.tab || link.textContent.trim();
            openLegalModal(tab);
        });
    });

    if (closeLegalFooterBtn) {
        closeLegalFooterBtn.addEventListener("click", () => {
            const legalModal = document.getElementById("legal-modal");
            if (legalModal) legalModal.classList.remove("show");
        });
    }

    // 8. Real-time Search Input & Clear
    function runSearch(query) {
        executeSearch(query, currentTrackIndex, isPlaying, (chosenIdx) => {
            if (currentTrackIndex === chosenIdx) {
                togglePlayPause();
            } else {
                loadTrack(chosenIdx);
                playTrack();
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const searchView = document.getElementById("search-view");
            if (searchView && searchView.style.display === "none") {
                showSearchView(false);
            }
            runSearch(e.target.value);
        });

        searchInput.addEventListener("focus", () => {
            const searchView = document.getElementById("search-view");
            if (searchView && searchView.style.display === "none") {
                showSearchView(false);
            }
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (searchInput) {
                searchInput.value = "";
                searchInput.focus();
            }
            runSearch("");
        });
    }

    browseTiles.forEach(tile => {
        tile.addEventListener("click", () => {
            const genre = tile.dataset.genre || tile.textContent.trim();
            if (searchInput) {
                searchInput.value = genre;
                searchInput.focus();
            }
            showSearchView(false);
            runSearch(genre);
        });
    });

    // 9. Album Card Clicks & Hover Play Button
    cards.forEach((card, index) => {
        const cardTrackIdx = index + 1; // 1-indexed for album cards
        const playBtn = card.querySelector(".play-btn");

        function handleCardPlay(e) {
            if (e) e.stopPropagation();
            if (currentTrackIndex === cardTrackIdx && isPlaying) {
                pauseTrack();
            } else {
                loadTrack(cardTrackIdx);
                playTrack();
            }
        }

        if (playBtn) playBtn.addEventListener("click", handleCardPlay);
        card.addEventListener("click", handleCardPlay);
    });

    // 10. Device Selector Popover Items
    deviceItems.forEach(item => {
        item.addEventListener("click", () => {
            deviceItems.forEach(i => {
                i.classList.remove("active");
                const iconBox = i.querySelector(".device-icon-box");
                if (iconBox) iconBox.classList.remove("active");
                const badge = i.querySelector(".device-badge");
                if (badge) badge.remove();
            });

            item.classList.add("active");
            const iconBox = item.querySelector(".device-icon-box");
            if (iconBox) iconBox.classList.add("active");

            const nameRow = item.querySelector(".device-name-row") || item.querySelector(".device-info");
            if (nameRow && !item.querySelector(".device-badge")) {
                const badge = document.createElement("span");
                badge.className = "device-badge";
                badge.textContent = "Connected";
                nameRow.appendChild(badge);
            }

            const deviceName = item.dataset.device || "Selected Device";
            showToast(`Connected to ${deviceName}`, "spotify-green", "fa-solid fa-volume-high");
            if (deviceView) deviceView.classList.remove("show");
            if (deviceBtn) deviceBtn.classList.add("active");
        });
    });

    // Close device popover when clicking outside
    document.addEventListener("click", (e) => {
        if (deviceView && deviceView.classList.contains("show")) {
            if (!deviceView.contains(e.target) && e.target !== deviceBtn && !deviceBtn.contains(e.target)) {
                deviceView.classList.remove("show");
                if (deviceBtn) deviceBtn.classList.remove("active");
            }
        }
    });

    // 11. Category Filter Chips (All, Music, Podcasts)
    categoryChips.forEach(chip => {
        chip.addEventListener("click", () => {
            categoryChips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            const chipText = chip.textContent.trim().toLowerCase();

            if (chipText === "all") {
                showHomeView();
                showToast("Showing All Content", "spotify-dark", "fa-solid fa-shapes");
            } else if (chipText === "music") {
                showHomeView();
                showToast("Showing Music Releases", "spotify-dark", "fa-solid fa-music");
            } else if (chipText === "podcasts") {
                if (searchInput) searchInput.value = "Podcast";
                showSearchView(false);
                runSearch("Podcast");
                showToast("Browse Podcasts", "spotify-dark", "fa-solid fa-podcast");
            }
        });
    });

    // 12. Section "Show all" Links
    showAllLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const header = link.closest(".section-header");
            const title = header ? header.querySelector("h2").textContent : "Section";
            showToast(`Showing all: ${title}`, "spotify-dark", "fa-solid fa-arrow-up-right-from-square");
        });
    });

    // 13. Main Footer Links & Socials
    mainFooterLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const text = link.textContent.trim() || link.getAttribute("title") || "Spotify Link";
            showToast(`${text} opened`, "spotify-dark", "fa-solid fa-arrow-up-right-from-square");
        });
    });

    // 14. Global Keyboard Shortcuts (Space, Mute, Like, Arrows, F, Q, L, /, Esc)
    document.addEventListener("keydown", (e) => {
        // When focused in search input: Escape clears search or blurs
        if (document.activeElement === searchInput || document.activeElement === filterLikedInput) {
            if (e.code === "Escape") {
                if (document.activeElement.value) {
                    document.activeElement.value = "";
                    if (document.activeElement === searchInput) runSearch("");
                    if (document.activeElement === filterLikedInput) renderLikedSongsTable("");
                } else {
                    document.activeElement.blur();
                    showHomeView();
                }
                return;
            }
        }

        // Global search shortcut: pressing '/' or Ctrl+K when not typing in an input
        if ((e.key === "/" || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
            e.preventDefault();
            showSearchView(true);
            return;
        }

        // Ignore media key presses if typing inside any form/input field
        if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;

        if (e.code === "Space") {
            e.preventDefault();
            togglePlayPause();
        } else if (e.code === "KeyM") {
            e.preventDefault();
            toggleMute(updateVolumeIcon);
        } else if (e.code === "KeyL") {
            e.preventDefault();
            handleLikeToggle();
        } else if (e.code === "KeyF") {
            e.preventDefault();
            toggleFullscreen();
        } else if (e.code === "KeyQ") {
            e.preventDefault();
            toggleQueue(currentTrackIndex);
        } else if (e.key === "[") {
            e.preventDefault();
            collapseSidebar();
        } else if (e.key === "]") {
            e.preventDefault();
            expandSidebar();
        } else if (e.code === "ArrowRight") {
            e.preventDefault();
            if (e.shiftKey) {
                nextTrack();
            } else if (!isNaN(audio.duration)) {
                audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
                showToast("+5s", "spotify-dark", "fa-solid fa-forward");
            }
        } else if (e.code === "ArrowLeft") {
            e.preventDefault();
            if (e.shiftKey) {
                prevTrack();
            } else if (!isNaN(audio.duration)) {
                audio.currentTime = Math.max(0, audio.currentTime - 5);
                showToast("-5s", "spotify-dark", "fa-solid fa-backward");
            }
        } else if (e.code === "Escape") {
            closeAllPanels();
            if (deviceView) deviceView.classList.remove("show");
            if (pipWidget) pipWidget.classList.remove("show");
        }
    });

    // 15. Header appearance on scroll
    if (mainContent) {
        const stickyNav = document.querySelector(".sticky-nav");
        mainContent.addEventListener("scroll", () => {
            if (stickyNav) {
                if (mainContent.scrollTop > 30) {
                    stickyNav.classList.add("scrolled");
                } else {
                    stickyNav.classList.remove("scrolled");
                }
            }
        });
    }

    // Load initial track (Daylight) & initialize like state
    loadTrack(0);
    updateLikeButtonUI(isTrackLiked(0));
    updateLibrarySidebarCount();
    initAuthListeners();
});
