# 🎵 Spotify Web Player Clone (Vanilla JavaScript)

A feature-rich, pixel-accurate web player recreation of Spotify built with **pure HTML5, Vanilla CSS3, and Modular ES6 JavaScript** — completely framework-free.

---

## 🚀 Live Demo

👉 **[Live Preview Link](https://saumya-mehta.github.io/spotify-clone/)**

---

## ✨ Features

### 🎧 Audio Engine & Playback Pipeline
* **Real Audio Streaming:** High-quality playback across 10 curated tracks.
* **Full Transport Controls:** Play, pause, previous, next, shuffle mode, and repeat mode.
* **Timeline Scrubbing:** Smooth interactive progress slider synchronized with real audio duration.
* **Dynamic Ambient Glow:** Background glow shifts color dynamically to match the active track.
* **OS MediaSession API:** Native lock-screen controls, physical keyboard media keys, and system playback notifications.

### 📚 Library & Liked Songs System
* **Dedicated Liked Songs View:** Hero banner, track count, instant play-all, and live in-playlist search filter.
* **Persistent Storage:** Liked songs and user-created playlists are preserved in browser `localStorage`.
* **Custom Playlists:** Create and name custom playlists via modal dialog, rendered directly in the sidebar.
* **Library Filtering:** Switch between *All*, *Playlists*, and *Podcasts*.

### 🔍 Real-Time Search & Discovery
* **Instant Search:** Client-side substring and fuzzy matching across track titles, artists, and genres.
* **Browse Genre Tiles:** Interactive genre cards (*Pop*, *Bollywood*, *Indie*, *Charts*, *Punjabi*, *Rock*, *Chill*).
* **Keyboard Navigation:** Press `/` or `Ctrl + K` to immediately jump into search from anywhere.

### 👤 Client-Side Authentication Simulation
* **User Accounts & Guest Mode:** Toggle between logged-in user experience and guest mode.
* **Auth Modal:** Clean tabbed modal supporting Login and Sign-Up with input validation.
* **⚡ One-Click Demo User:** Quick-fill button (`alex@spotify.com` / `password123`) for fast testing.
* **Profile Popover:** Access account settings, active plan badge, and 1-click logout.

### 🎛️ Modals, Drawers & Utilities
* **Synchronized Lyrics:** Timed lyrics drawer with active line highlighting.
* **Queue Panel:** Real-time playlist queue drawer showing currently playing and upcoming songs.
* **Mini Player (Picture-in-Picture):** Floating playback widget.
* **Modals:** *Explore Premium* (4 plan tiers), *Install Desktop App*, *Language Selector* (10 languages), and *Legal Terms*.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Space` | Play / Pause |
| `M` | Mute / Unmute audio |
| `L` | Like / Unlike current track |
| `F` | Toggle Fullscreen |
| `Q` | Open / Close Queue drawer |
| `/` or `Ctrl + K` | Focus Search bar |
| `[` / `]` | Collapse / Expand sidebar |
| `→` / `←` | Seek forward / backward 5 seconds |
| `Shift + →` / `Shift + ←` | Next / Previous track |
| `Esc` | Close any active modal, panel, or search |

---

## 📁 Modular Project Structure

```
SPOTIFY CLONE/
│
├── index.html            # Semantic HTML5 entry structure
├── style.css             # Master stylesheet importing modular CSS
│
├── css/                  # Modular Vanilla CSS
│   ├── base.css          # Design tokens, reset, typography & scrollbars
│   ├── sidebar.css       # Sidebar navigation & library cards
│   ├── main-content.css  # Hero banners, card grids & sticky nav
│   ├── player.css        # Bottom music player & playback sliders
│   ├── overlays.css      # Lyrics panel, queue drawer & mini-player
│   ├── search.css        # Search view, browse tiles & live results
│   ├── library.css       # Liked songs view, hero banner & track table
│   └── modals.css        # Universal modals, auth modal & popovers
│
├── js/                   # Modular ES6 JavaScript
│   ├── main.js           # Master entry point & centralized state sync
│   ├── audioEngine.js    # Audio playback pipeline & MediaSession API
│   ├── data.js           # Track playlist database & metadata
│   ├── library.js        # Liked songs & user playlist manager
│   ├── auth.js           # Client-side authentication & session state
│   ├── search.js         # Real-time search engine & view routing
│   ├── modals.js         # Dialogs, popovers & plan selectors
│   ├── ui.js             # Panels, drawers, PiP & visual updates
│   └── utils.js          # Time formatters, toasts & sanitization
│
└── assets/               # Audio files, covers, and icons
```

---

## 🛠️ How to Run Locally

### Prerequisites
* A modern web browser (Chrome, Edge, Firefox, Safari).
* [VS Code](https://code.visualstudio.com/) (recommended) or any code editor.

### Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/Saumya-Mehta/spotify-clone.git
   cd spotify-clone
   ```

2. **Serve locally:**
   *Using VS Code:*
   * Install the **Live Server** extension.
   * Right-click `index.html` and click **"Open with Live Server"**.

   *Using Node.js terminal:*
   ```bash
   npx serve
   ```
   Open `http://localhost:3000` in your browser.

---

## 📄 Disclaimer
This project is an educational demonstration created for learning and portfolio purposes. All music, artwork, and trademarks belong to their respective copyright holders.
