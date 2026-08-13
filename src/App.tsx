import React, { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { WatchlistProvider } from './context/WatchlistContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { AppRoutes } from './routes/AppRoutes';
import { validateAnimeImages } from './utils/validateAnimeImages';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {!isAdminRoute && <Navbar />}
      <div className="flex-1">
        <AppRoutes />
      </div>
      <Toast />
      {!isAdminRoute && <Footer />}
    </div>
  );
};

export default function App() {
  useEffect(() => {
    validateAnimeImages();
  }, []);

  return (
    <BrowserRouter>
      <WatchlistProvider>
        <MainLayout />
      </WatchlistProvider>
    </BrowserRouter>
  );
}
