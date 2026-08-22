import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Browse } from '../pages/Browse';
import { Genres } from '../pages/Genres';
import { Trending } from '../pages/Trending';
import { Popular } from '../pages/Popular';
import { AnimeDetail } from '../pages/AnimeDetail';
import { WatchPage } from '../pages/WatchPage';
import { SearchPage } from '../pages/SearchPage';
import { WatchlistPage } from '../pages/WatchlistPage';
import { ProfilePage } from '../pages/ProfilePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Admin Pages
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminAnimeListPage } from '../pages/admin/AdminAnimeListPage';
import { AdminAddAnimePage } from '../pages/admin/AdminAddAnimePage';
import { AdminEditAnimePage } from '../pages/admin/AdminEditAnimePage';
import { AdminEpisodesPage } from '../pages/admin/AdminEpisodesPage';
import { AdminVideosPage } from '../pages/admin/AdminVideosPage';
import { AdminGenresPage } from '../pages/admin/AdminGenresPage';
import { ProtectedRoute } from '../components/admin/ProtectedRoute';
import { AdminErrorBoundary } from '../components/admin/AdminErrorBoundary';

// Helper component to scroll window to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export const AppRoutes: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Browsing & Viewing Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/genres" element={<Genres />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/popular" element={<Popular />} />
        <Route path="/anime/:id" element={<AnimeDetail />} />
        <Route path="/watch/:animeId/:episodeId" element={<WatchPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin Login Route */}
        <Route
          path="/admin/login"
          element={
            <AdminErrorBoundary>
              <AdminLoginPage />
            </AdminErrorBoundary>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/anime"
          element={
            <ProtectedRoute>
              <AdminAnimeListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/anime/add"
          element={
            <ProtectedRoute>
              <AdminAddAnimePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/anime/edit/:id"
          element={
            <ProtectedRoute>
              <AdminEditAnimePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/episodes"
          element={
            <ProtectedRoute>
              <AdminEpisodesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/videos"
          element={
            <ProtectedRoute>
              <AdminVideosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/genres"
          element={
            <ProtectedRoute>
              <AdminGenresPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};
