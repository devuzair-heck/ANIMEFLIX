# AnimeFlix — Premium Anime Streaming Web Application (Phase 1)

**AnimeFlix** is a dark, cinematic, modern anime streaming web application built with React, Vite, Tailwind CSS, and React Router.

---

## 🎨 Design System

- **Background:** Dark Obsidian (`#080808`)
- **Secondary Background:** Deep Charcoal (`#111111`)
- **Cards Background:** Glass Obsidian (`#171717`)
- **Text:** High-Contrast Pure White (`#FFFFFF`) and Light Slate (`#A3A3A3`)
- **Accent Color:** Crimson Red (`#E50914` / `#DC2626`)
- **Typography:** Plus Jakarta Sans
- **Effects:** Glassmorphism, subtle scale animations, dark vignette overlays, rounded cards, cinematic shadows.

---

## 📂 Project Architecture

```
animeflix/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── AnimeCard.tsx
│   │   ├── AnimeRow.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroSlider.tsx
│   │   ├── Navbar.tsx
│   │   └── Toast.tsx
│   ├── context/
│   │   └── WatchlistContext.tsx
│   ├── pages/
│   │   ├── AnimeDetail.tsx
│   │   ├── Browse.tsx
│   │   ├── Genres.tsx
│   │   ├── Home.tsx
│   │   ├── LoginPage.tsx
│   │   ├── Popular.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── SearchPage.tsx
│   │   ├── Trending.tsx
│   │   ├── WatchlistPage.tsx
│   │   └── WatchPage.tsx
│   ├── routes/
│   │   └── AppRoutes.tsx
│   ├── types/
│   │   └── anime.ts
│   ├── utils/
│   │   └── animeData.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── package.json
└── README.md
```

---

## 🚀 Routes Included

| Route | Page Description |
|---|---|
| `/` | **Home Page**: Hero Slider, Trending, Popular, Recently Added, Latest Episodes, Top Rated |
| `/browse` | **Browse Library**: Filter by search query, genre, format (TV/Movie), status, sort by rating/popularity |
| `/genres` | **Genres Explorer**: Interactive genre cards with instant title counter and genre filtering |
| `/trending` | **Trending Leaderboard**: Ranked #1 to #10 anime cards with Gold/Silver/Bronze badges |
| `/popular` | **Most Popular**: All-time top fan favorites sorted by rating |
| `/anime/:id` | **Anime Detail Page**: Backdrop banner, poster, synopsis, studio, ratings, episode list, characters |
| `/watch/:animeId/:episodeId` | **Watch Page**: Custom video player UI, server switcher, theater mode, episode selector sidebar, comments |
| `/search` | **Search Page**: Live query input, search chips, real-time results |
| `/watchlist` | **Watchlist**: Saved collection, filter by ongoing/completed, persistent `localStorage` sync |
| `/profile` | **User Profile**: Watch stats (hours watched, total episodes), watch history, settings preview |
| `/login` | **Sign In**: Dark cinematic login form with password toggle |
| `/register` | **Sign Up**: Account registration form prepared for future backend auth |

---

## 🛠️ Instructions to Run

To run the application locally:

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

The application will launch on `http://localhost:3000`.
