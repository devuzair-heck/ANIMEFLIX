import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Settings,
  Volume2,
  Maximize,
  Server,
  MessageSquare,
  Send,
  ListFilter
} from 'lucide-react';
import { DEMO_ANIME } from '../utils/animeData';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { AnimeImage } from '../components/AnimeImage';

export const WatchPage: React.FC = () => {
  const { animeId, episodeId } = useParams<{ animeId: string; episodeId: string }>();
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeServer, setActiveServer] = useState('Server 1 (Primary - HD)');
  const [theaterMode, setTheaterMode] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    { id: '1', user: 'AnimeKing99', text: 'This episode animation quality is unbelievable!', time: '2 hours ago' },
    { id: '2', user: 'OtakuGirl', text: 'The plot twist at the end left me speechless.', time: '5 hours ago' }
  ]);

  const anime = DEMO_ANIME.find((a) => a.id === animeId);
  const currentEpisodeIndex = anime
    ? anime.episodes.findIndex((ep) => ep.id === episodeId || ep.number.toString() === episodeId)
    : -1;

  const currentEpisode = anime && currentEpisodeIndex !== -1 ? anime.episodes[currentEpisodeIndex] : null;

  // Error state if invalid anime or episode
  if (!anime || !currentEpisode) {
    return (
      <div className="min-h-screen bg-[#080808] text-white pt-28 pb-20 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#DC143C]/10 border border-[#DC143C]/20 flex items-center justify-center text-[#DC143C] mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Episode Not Found</h1>
        <p className="text-sm text-neutral-400 max-w-md mb-6">
          The requested episode or anime stream could not be loaded. Please check the URL or return to the main catalog.
        </p>
        <Link
          to={anime ? `/anime/${anime.id}` : '/browse'}
          className="bg-[#DC143C] hover:bg-[#b01030] text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-sm transition-colors shadow-lg"
        >
          {anime ? `Back to ${anime.title}` : 'Back to Browse'}
        </Link>
      </div>
    );
  }

  const prevEpisode = currentEpisodeIndex > 0 ? anime.episodes[currentEpisodeIndex - 1] : null;
  const nextEpisode = currentEpisodeIndex < anime.episodes.length - 1 ? anime.episodes[currentEpisodeIndex + 1] : null;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments([
      { id: Date.now().toString(), user: 'You (Logged in)', text: commentText, time: 'Just now' },
      ...comments,
    ]);
    setCommentText('');
  };

  return (
    <div className={`min-h-screen bg-[#080808] text-white pt-20 pb-20 transition-all ${theaterMode ? 'bg-black' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Header */}
        <div className="mb-4">
          <Breadcrumbs
            items={[
              { label: 'Anime', path: '/browse' },
              { label: anime.title, path: `/anime/${anime.id}` },
              { label: `Episode ${currentEpisode.number}` },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Video Stream Player Area (3 Columns on desktop) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Professional Video Player Placeholder Container */}
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-red-950/20 group">
              
              {/* Background Thumbnail preview */}
              <AnimeImage
                src={currentEpisode.thumbnail || anime.banner || anime.poster}
                alt={currentEpisode.title}
                type="thumbnail"
                animeTitle={currentEpisode.title}
                className="w-full h-full object-cover opacity-70 filter brightness-90"
              />

              {/* Dark Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />

              {/* Play / Pause Interactive Center Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#DC143C]/90 hover:bg-[#DC143C] text-white flex items-center justify-center shadow-2xl shadow-red-900/60 transform hover:scale-110 transition-all border-2 border-white/20"
                  title={isPlaying ? 'Pause' : 'Play Stream'}
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 fill-white" />
                  ) : (
                    <Play className="w-8 h-8 fill-white ml-1" />
                  )}
                </button>
              </div>

              {/* Top Bar inside Player */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{activeServer}</span>
                </div>

                <span className="bg-[#DC143C] text-white font-black text-[10px] px-2.5 py-1 rounded uppercase tracking-wider">
                  1080p FULL HD
                </span>
              </div>

              {/* Bottom Video Controls Bar */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 flex flex-col gap-2 z-10 opacity-90 group-hover:opacity-100 transition-opacity">
                
                {/* Seekbar Line */}
                <div className="w-full h-1.5 bg-white/20 hover:h-2.5 rounded-full cursor-pointer relative transition-all">
                  <div className="w-1/3 h-full bg-[#DC143C] rounded-full relative">
                    <div className="w-3 h-3 bg-white rounded-full absolute -right-1.5 -top-0.5 shadow" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-[#DC143C] transition-colors">
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <Volume2 className="w-4 h-4 text-neutral-300 cursor-pointer hover:text-white" />
                    <span className="text-neutral-400 font-medium">08:24 / {currentEpisode.duration}</span>
                  </div>

                  <div className="flex items-center gap-3 text-neutral-300">
                    <button
                      onClick={() => setTheaterMode(!theaterMode)}
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border transition-colors ${
                        theaterMode ? 'bg-[#DC143C] text-white border-[#DC143C]' : 'bg-black/50 hover:bg-white/10 border-white/10'
                      }`}
                    >
                      Theater Mode
                    </button>
                    <Settings className="w-4 h-4 cursor-pointer hover:text-white" />
                    <Maximize className="w-4 h-4 cursor-pointer hover:text-white" />
                  </div>
                </div>

              </div>

            </div>

            {/* Video Meta & Controls Bar below video */}
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
              
              {/* Prev / Next Episode Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-bold text-[#DC143C] uppercase tracking-wider block">
                    EPISODE {currentEpisode.number}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tight">
                    {currentEpisode.title}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => prevEpisode && navigate(`/watch/${anime.id}/${prevEpisode.id}`)}
                    disabled={!prevEpisode}
                    className="flex items-center gap-1.5 bg-[#080808] hover:bg-white/10 disabled:opacity-40 border border-white/10 text-xs font-bold px-4 py-2.5 rounded-sm uppercase tracking-wider transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev Ep</span>
                  </button>

                  <button
                    onClick={() => nextEpisode && navigate(`/watch/${anime.id}/${nextEpisode.id}`)}
                    disabled={!nextEpisode}
                    className="flex items-center gap-1.5 bg-[#DC143C] hover:bg-[#b01030] disabled:opacity-40 text-white text-xs font-bold px-4 py-2.5 rounded-sm uppercase tracking-wider transition-colors shadow-lg"
                  >
                    <span>Next Ep</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Streaming Server Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-[#DC143C]" />
                  Streaming Server:
                </span>
                {['Server 1 (Primary - HD)', 'Server 2 (Backup)', 'Server 3 (Multi-Sub)'].map((srv) => (
                  <button
                    key={srv}
                    onClick={() => setActiveServer(srv)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-sm uppercase tracking-wider transition-colors ${
                      activeServer === srv
                        ? 'bg-[#DC143C] text-white'
                        : 'bg-[#080808] hover:bg-white/10 text-neutral-300 border border-white/10'
                    }`}
                  >
                    {srv}
                  </button>
                ))}
              </div>

            </div>

            {/* Episode Discussion & Comments Section */}
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#DC143C]" />
                <span>Episode Discussion ({comments.length})</span>
              </h3>

              <form onSubmit={handleAddComment} className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts about this episode..."
                  className="flex-1 bg-[#080808] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#DC143C]"
                />
                <button
                  type="submit"
                  className="bg-[#DC143C] hover:bg-[#b01030] text-white px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </form>

              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="bg-[#171717] border border-white/5 p-3.5 rounded-xl">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-[#DC143C]">{c.user}</span>
                      <span className="text-[10px] text-neutral-500">{c.time}</span>
                    </div>
                    <p className="text-xs text-neutral-300">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Episode List Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <span className="font-extrabold text-xs uppercase text-white flex items-center gap-2">
                  <ListFilter className="w-4 h-4 text-[#DC143C]" />
                  Episode List ({anime.episodes.length})
                </span>
                <Link
                  to={`/anime/${anime.id}`}
                  className="text-[10px] text-[#DC143C] font-bold uppercase hover:underline"
                >
                  All Details
                </Link>
              </div>

              <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1">
                {anime.episodes.map((ep) => {
                  const isActive = ep.id === currentEpisode.id;
                  return (
                    <Link
                      key={ep.id}
                      to={`/watch/${anime.id}/${ep.id}`}
                      className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                        isActive
                          ? 'bg-[#DC143C]/20 border-[#DC143C] text-white'
                          : 'bg-[#171717] hover:bg-white/10 border-white/5 text-neutral-300'
                      }`}
                    >
                      <div className="relative w-16 aspect-video rounded overflow-hidden bg-black flex-shrink-0">
                        <AnimeImage
                          src={ep.thumbnail}
                          alt={ep.title}
                          type="thumbnail"
                          animeTitle={ep.title}
                          className="w-full h-full object-cover"
                        />
                        {isActive && (
                          <div className="absolute inset-0 bg-[#DC143C]/60 flex items-center justify-center">
                            <Play className="w-4 h-4 fill-white text-white" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className={`text-[10px] font-black uppercase block ${isActive ? 'text-[#DC143C]' : 'text-neutral-400'}`}>
                          EPISODE {ep.number}
                        </span>
                        <h4 className="text-xs font-bold truncate">{ep.title}</h4>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
