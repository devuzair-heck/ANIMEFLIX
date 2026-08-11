import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { WatchlistProvider } from './context/WatchlistContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <WatchlistProvider>
        <div className="min-h-screen bg-[#080808] text-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
          <Navbar />
          <div className="flex-1">
            <AppRoutes />
          </div>
          <Toast />
          <Footer />
        </div>
      </WatchlistProvider>
    </BrowserRouter>
  );
}
