import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipForward,
  SkipBack,
  Settings,
  Server,
  Lightbulb,
  MessageSquare,
  ThumbsUp,
  Bookmark,
  BookmarkCheck,
  Share2,
  List,
  Sparkles,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { DEMO_ANIME } from '../utils/animeData';
import { useWatchlist } from '../context/WatchlistContext';

export const WatchPage: React.FC = () => {
  const { animeId, episodeId } = useParams<{ animeId: string; episodeId: string }>();
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const anime = DEMO_ANIME.find((a) => a.id === animeId) || DEMO_ANIME[0];
  const currentEpisodeIndex = anime.episodes.findIndex((e) => e.id === episodeId);
  const activeEpisodeIndex = currentEpisodeIndex !== -1 ? currentEpisodeIndex : 0;
  const currentEpisode = anime.episodes[activeEpisodeIndex] || anime.episodes[0];

  const inWatchlist = isInWatchlist(anime.id);

  // Player State Mockups
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedServer, setSelectedServer] = useState('Server 1 (HD)');
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [autoNext, setAutoNext] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(1420);
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState([
    { id: '1', user: 'OtakuMaster99', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', text: 'This episode animation was insane! Studio went all out!', time: '2 hours ago', likes: 24 },
    { id: '2', user: 'AnimeFanatic', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', text: 'Can’t wait for the next episode. Cliffhanger was wild!', time: '5 hours ago', likes: 12 }
  ]);

  const handlePrevEp = () => {
    if (activeEpisodeIndex > 0) {
      const prevEp = anime.episodes[activeEpisodeIndex - 1];
      navigate(`/watch/${anime.id}/${prevEp.id}`);
    }
  };

  const handleNextEp = () => {
    if (activeEpisodeIndex < anime.episodes.length - 1) {
      const nextEp = anime.episodes[activeEpisodeIndex + 1];
      navigate(`/watch/${anime.id}/${nextEp.id}`);
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentInput.trim()) {
      setComments([
        {
          id: Date.now().toString(),
          user: 'You (Guest User)',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
          text: commentInput.trim(),
          time: 'Just now',
          likes: 0,
        },
        ...comments,
      ]);
      setCommentInput('');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isTheaterMode ? 'bg-black text-white' : 'bg-[#080808] text-white'} pt-20 pb-16`}>
      
      {/* Top Banner Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 flex items-center justify-between">
        <Link
          to={`/anime/${anime.id}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-neutral-300 hover:text-white bg-[#171717] px-4 py-2 rounded-xl border border-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Details</span>
        </Link>

        {/* Theater Light Switch button */}
        <button
          onClick={() => setIsTheaterMode(!isTheaterMode)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            isTheaterMode
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
              : 'bg-[#171717] hover:bg-neutral-800 text-neutral-300 border border-white/10'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>{isTheaterMode ? 'Normal View' : 'Theater Mode'}</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Player Column (Left 2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            
            {/* Custom Video Player UI */}
            <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
              
              {/* Background Video Poster Artwork */}
              <img
                src={currentEpisode.thumbnail || anime.banner || anime.poster}
                alt={currentEpisode.title}
                className={`w-full h-full object-cover transition-filter duration-500 ${isPlaying ? 'brightness-100' : 'brightness-50'}`}
              />

              {/* Big Center Play Button Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-xs">
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-2xl shadow-red-900/60 hover:scale-110 transition-all duration-300"
                    aria-label="Play Episode"
                  >
                    <Play className="w-9 h-9 fill-white ml-1" />
                  </button>
                  <p className="mt-4 text-sm font-bold text-white tracking-wider">
                    CLICK TO PLAY EPISODE {currentEpisode.number}
                  </p>
                </div>
              )}

              {/* Top Bar inside Player */}
              <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-sm font-bold text-white truncate max-w-md">
                  {anime.title} — Episode {currentEpisode.number}
                </span>
                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded">
                  1080p HD
                </span>
              </div>

              {/* Bottom Control Bar inside Player */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                
                {/* Seekbar */}
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden cursor-pointer">
                  <div className={`h-full bg-red-600 ${isPlaying ? 'w-2/5' : 'w-0'} transition-all`} />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="text-white hover:text-red-500 transition-colors"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                    </button>

                    <button
                      onClick={handlePrevEp}
                      disabled={activeEpisodeIndex === 0}
                      className="text-neutral-300 hover:text-white disabled:opacity-40"
                      aria-label="Previous Episode"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleNextEp}
                      disabled={activeEpisodeIndex === anime.episodes.length - 1}
                      className="text-neutral-300 hover:text-white disabled:opacity-40"
                      aria-label="Next Episode"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-neutral-300 hover:text-white"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <span className="text-neutral-400 font-mono text-[11px]">
                      {isPlaying ? '09:42' : '00:00'} / {currentEpisode.duration}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="text-neutral-300 hover:text-white" aria-label="Settings">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button className="text-neutral-300 hover:text-white" aria-label="Fullscreen">
                      <Maximize className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Server Selector & Quick Options */}
            <div className="bg-[#171717] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
              
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-red-500" />
                <span className="text-xs font-bold text-neutral-400 uppercase">Streaming Server:</span>
                <div className="flex gap-2">
                  {['Server 1 (HD)', 'Server 2 (FHD)', 'Backup Server'].map((srv) => (
                    <button
                      key={srv}
                      onClick={() => setSelectedServer(srv)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                        selectedServer === srv
                          ? 'bg-red-600 border-red-500 text-white'
                          : 'bg-[#0d0d0d] border-white/10 hover:border-white/20 text-neutral-300'
                      }`}
                    >
                      {srv}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Next Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-medium">Auto Next Episode</span>
                <button
                  onClick={() => setAutoNext(!autoNext)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${autoNext ? 'bg-red-600' : 'bg-neutral-800'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoNext ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

            </div>

            {/* Episode Title & Info */}
            <div className="bg-[#171717] border border-white/10 rounded-2xl p-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
                <div>
                  <span className="text-xs font-bold text-red-500 uppercase tracking-wider">
                    Episode {currentEpisode.number} of {anime.episodesCount}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                    {currentEpisode.title}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    {anime.title} • {anime.type} • {anime.studio}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setLiked(!liked);
                      setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-colors ${
                      liked ? 'bg-red-600/20 text-red-400 border-red-500/50' : 'bg-[#0d0d0d] border-white/10 text-neutral-300 hover:text-white'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{likesCount}</span>
                  </button>

                  <button
                    onClick={() => toggleWatchlist(anime)}
                    className={`p-2.5 rounded-xl border transition-colors ${
                      inWatchlist ? 'bg-red-600 text-white border-red-600' : 'bg-[#0d0d0d] border-white/10 text-neutral-300 hover:text-white'
                    }`}
                    title="Watchlist"
                  >
                    {inWatchlist ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <p className="text-sm text-neutral-300 leading-relaxed">
                {currentEpisode.description || anime.description}
              </p>

            </div>

            {/* Comments & Discussion */}
            <div className="bg-[#171717] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6">
                <MessageSquare className="w-5 h-5 text-red-600" />
                <span>Discussion & Comments ({comments.length})</span>
              </h3>

              {/* Comment Post Form */}
              <form onSubmit={handlePostComment} className="mb-8">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold text-white flex-shrink-0">
                    U
                  </div>
                  <div className="flex-1">
                    <textarea
                      rows={2}
                      placeholder="Share your thoughts about this episode..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-600 resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-colors"
                      >
                        Post Comment
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Comments List */}
              <div className="flex flex-col gap-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-[#0d0d0d] border border-white/5 rounded-xl p-4 flex gap-3">
                    <img src={comment.avatar} alt={comment.user} className="w-9 h-9 rounded-full object-cover border border-white/10" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-white">{comment.user}</span>
                        <span className="text-[11px] text-neutral-500">{comment.time}</span>
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* Right Sidebar: Episode Selector */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            
            <div className="bg-[#171717] border border-white/10 rounded-2xl p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <List className="w-4 h-4 text-red-500" />
                  <span>Episodes ({anime.episodes.length})</span>
                </h3>
                <span className="text-xs text-neutral-400 font-bold">
                  {activeEpisodeIndex + 1} / {anime.episodes.length}
                </span>
              </div>

              {/* Episode List Scroll Container */}
              <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto no-scrollbar pr-1">
                {anime.episodes.map((ep, idx) => {
                  const isActive = idx === activeEpisodeIndex;

                  return (
                    <Link
                      key={ep.id}
                      to={`/watch/${anime.id}/${ep.id}`}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-red-600/20 border-red-500/50 text-white'
                          : 'bg-[#0d0d0d] border-white/5 hover:border-white/20 text-neutral-300'
                      }`}
                    >
                      <div className="relative w-20 aspect-video rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0">
                        <img src={ep.thumbnail} alt={ep.title} className="w-full h-full object-cover" />
                        {isActive && (
                          <div className="absolute inset-0 bg-red-600/60 flex items-center justify-center">
                            <Play className="w-4 h-4 text-white fill-white animate-pulse" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className={`text-[10px] font-extrabold uppercase ${isActive ? 'text-red-400' : 'text-neutral-400'}`}>
                          Episode {ep.number}
                        </span>
                        <h4 className="text-xs font-bold truncate">{ep.title}</h4>
                        <span className="text-[10px] text-neutral-500">{ep.duration}</span>
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
