import React, { useState, useEffect } from 'react';
import {
  Video,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Edit,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Play,
  Tv,
  Globe,
  Radio,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { videoService } from '../../services/videoService';
import { animeService } from '../../services/animeService';
import { VideoStream, Anime } from '../../types/anime';

export const AdminVideosPage: React.FC = () => {
  const [videos, setVideos] = useState<VideoStream[]>([]);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnime, setSelectedAnime] = useState('all');
  const [selectedQuality, setSelectedQuality] = useState('all');
  const [selectedSubDub, setSelectedSubDub] = useState('all');

  // Add/Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoStream | null>(null);
  const [formData, setFormData] = useState({
    animeId: '',
    animeTitle: '',
    episodeNumber: 1,
    videoUrl: '',
    videoType: 'MP4' as 'MP4' | 'HLS' | 'Embed',
    quality: '1080p' as '1080p' | '720p' | '480p' | 'Auto',
    language: 'Japanese',
    subDub: 'SUB' as 'SUB' | 'DUB' | 'BOTH',
    serverName: 'Server 1 (Primary - HD)',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VideoStream | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [animeRes, videoRes] = await Promise.all([
        animeService.getAllAnime(),
        videoService.getAllVideos(),
      ]);
      setAnimeList(animeRes);
      setVideos(videoRes);
      if (animeRes.length > 0 && !formData.animeId) {
        setFormData((prev) => ({
          ...prev,
          animeId: animeRes[0].id,
          animeTitle: animeRes[0].title,
        }));
      }
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingVideo(null);
    const firstAnime = animeList[0];
    setFormData({
      animeId: firstAnime ? firstAnime.id : '',
      animeTitle: firstAnime ? firstAnime.title : '',
      episodeNumber: 1,
      videoUrl: '',
      videoType: 'MP4',
      quality: '1080p',
      language: 'Japanese',
      subDub: 'SUB',
      serverName: 'Server 1 (Primary - HD)',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (v: VideoStream) => {
    setEditingVideo(v);
    setFormData({
      animeId: v.animeId,
      animeTitle: v.animeTitle,
      episodeNumber: v.episodeNumber,
      videoUrl: v.videoUrl,
      videoType: v.videoType,
      quality: v.quality,
      language: v.language,
      subDub: v.subDub,
      serverName: v.serverName,
    });
    setShowModal(true);
  };

  const handleAnimeChange = (animeId: string) => {
    const selected = animeList.find((a) => a.id === animeId);
    setFormData((prev) => ({
      ...prev,
      animeId,
      animeTitle: selected ? selected.title : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.videoUrl.trim() || !formData.animeId) return;

    setIsSubmitting(true);
    try {
      if (editingVideo) {
        const res = await videoService.updateVideo(editingVideo.id, formData);
        if (res.success) {
          setVideos((prev) =>
            prev.map((v) => (v.id === editingVideo.id ? { ...v, ...formData } : v))
          );
          setActionMessage('Video stream source updated successfully.');
          setShowModal(false);
        }
      } else {
        const res = await videoService.createVideo({
          ...formData,
          episodeId: `${formData.animeId}-ep-${formData.episodeNumber}`,
        });
        if (res.success && res.data) {
          setVideos((prev) => [res.data!, ...prev]);
          setActionMessage('Video stream source added successfully.');
          setShowModal(false);
        }
      }
      setTimeout(() => setActionMessage(null), 4000);
    } catch {
      // Handled
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await videoService.deleteVideo(deleteTarget.id);
      if (res.success) {
        setVideos((prev) => prev.filter((v) => v.id !== deleteTarget.id));
        setActionMessage('Video stream deleted.');
        setTimeout(() => setActionMessage(null), 4000);
      }
      setDeleteTarget(null);
    } catch {
      // Handled
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredVideos = videos.filter((v) => {
    const matchesSearch =
      v.animeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.serverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.videoUrl.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAnime = selectedAnime === 'all' || v.animeId === selectedAnime;
    const matchesQuality = selectedQuality === 'all' || v.quality === selectedQuality;
    const matchesSubDub = selectedSubDub === 'all' || v.subDub === selectedSubDub;

    return matchesSearch && matchesAnime && matchesQuality && matchesSubDub;
  });

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#DC143C] bg-[#DC143C]/10 border border-[#DC143C]/20 px-2.5 py-0.5 rounded-md">
                Stream CDN & Sources
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight text-white">
              Video Management
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Manage streaming servers, MP4/HLS direct URLs, embed links, and resolutions ({filteredVideos.length} sources)
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            id="admin-add-video-btn"
            className="inline-flex items-center gap-2 bg-[#DC143C] hover:bg-[#b01030] active:scale-[0.98] text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-lg shadow-[#DC143C]/20 transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Video Stream</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {actionMessage && (
          <div className="bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Filter Controls */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by anime, server name, or URL..."
              className="w-full bg-[#181818] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#DC143C]"
            />
          </div>

          {/* Anime Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-neutral-500 shrink-0" />
            <select
              value={selectedAnime}
              onChange={(e) => setSelectedAnime(e.target.value)}
              className="bg-[#181818] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-[#DC143C] max-w-[180px]"
            >
              <option value="all">All Anime</option>
              {animeList.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>

            {/* Quality Filter */}
            <select
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value)}
              className="bg-[#181818] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-[#DC143C]"
            >
              <option value="all">All Qualities</option>
              <option value="1080p">1080p Full HD</option>
              <option value="720p">720p HD</option>
              <option value="480p">480p SD</option>
              <option value="Auto">Auto Adaptive</option>
            </select>

            {/* Audio/Sub Filter */}
            <select
              value={selectedSubDub}
              onChange={(e) => setSelectedSubDub(e.target.value)}
              className="bg-[#181818] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-[#DC143C]"
            >
              <option value="all">SUB & DUB</option>
              <option value="SUB">SUB Only</option>
              <option value="DUB">DUB Only</option>
              <option value="BOTH">Dual Audio</option>
            </select>
          </div>
        </div>

        {/* Video Streams Table */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#DC143C] animate-spin" />
              <span className="text-xs text-neutral-400 font-medium">Loading video sources...</span>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <Video className="w-10 h-10 text-neutral-600 mb-3" />
              <h3 className="text-base font-bold text-white uppercase">No video sources found</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                Add your first stream URL or adjust your search filter above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161616] text-neutral-400 uppercase tracking-wider text-[10px] font-bold border-b border-white/5">
                  <tr>
                    <th className="py-3.5 px-4">Anime & Episode</th>
                    <th className="py-3.5 px-4">Server Name</th>
                    <th className="py-3.5 px-4">Stream Type</th>
                    <th className="py-3.5 px-4">Quality</th>
                    <th className="py-3.5 px-4">Audio / Sub</th>
                    <th className="py-3.5 px-4">Video URL</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-neutral-300">
                  {filteredVideos.map((video) => (
                    <tr key={video.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Anime & Episode */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm truncate max-w-xs">
                            {video.animeTitle}
                          </span>
                          <span className="text-[10px] font-black text-[#DC143C] uppercase tracking-wider">
                            Episode {video.episodeNumber}
                          </span>
                        </div>
                      </td>

                      {/* Server */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 font-mono text-[11px] text-neutral-300">
                          {video.serverName}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {video.videoType}
                        </span>
                      </td>

                      {/* Quality */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#DC143C]/10 text-[#DC143C] border border-[#DC143C]/20">
                          {video.quality}
                        </span>
                      </td>

                      {/* Audio */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-300">
                            {video.subDub}
                          </span>
                          <span className="text-[10px] text-neutral-500">({video.language})</span>
                        </div>
                      </td>

                      {/* URL Preview */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-mono text-[11px] text-neutral-400 truncate block">
                          {video.videoUrl}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <a
                            href={video.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-neutral-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            title="Test Stream Link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(video)}
                            className="p-2 text-neutral-400 hover:text-[#DC143C] rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            title="Edit Video Source"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(video)}
                            className="p-2 text-neutral-400 hover:text-red-400 rounded-lg bg-white/5 hover:bg-red-950/40 transition-colors"
                            title="Delete Video Source"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create / Edit Video Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-lg font-black uppercase italic text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-[#DC143C]" />
                  <span>{editingVideo ? 'Edit Video Stream' : 'Add New Video Stream'}</span>
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Anime Selector */}
                <div>
                  <label className="block text-neutral-400 font-bold uppercase tracking-wider mb-1">
                    Select Anime Series *
                  </label>
                  <select
                    value={formData.animeId}
                    onChange={(e) => handleAnimeChange(e.target.value)}
                    required
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#DC143C]"
                  >
                    {animeList.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Episode Number */}
                  <div>
                    <label className="block text-neutral-400 font-bold uppercase tracking-wider mb-1">
                      Episode Number *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.episodeNumber}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, episodeNumber: Number(e.target.value) }))
                      }
                      required
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#DC143C]"
                    />
                  </div>

                  {/* Server Name */}
                  <div>
                    <label className="block text-neutral-400 font-bold uppercase tracking-wider mb-1">
                      Server Name
                    </label>
                    <input
                      type="text"
                      value={formData.serverName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, serverName: e.target.value }))
                      }
                      placeholder="Server 1 (Primary - HD)"
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#DC143C]"
                    />
                  </div>
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-neutral-400 font-bold uppercase tracking-wider mb-1">
                    Video Direct Stream URL (MP4 / HLS / Embed) *
                  </label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))
                    }
                    placeholder="https://example.com/video.mp4 or https://cdn.sample.com/master.m3u8"
                    required
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono text-[11px] focus:outline-none focus:border-[#DC143C]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Video Type */}
                  <div>
                    <label className="block text-neutral-400 font-bold uppercase tracking-wider mb-1">
                      Stream Format
                    </label>
                    <select
                      value={formData.videoType}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, videoType: e.target.value as any }))
                      }
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#DC143C]"
                    >
                      <option value="MP4">MP4 Video</option>
                      <option value="HLS">HLS (m3u8)</option>
                      <option value="Embed">Iframe Embed</option>
                    </select>
                  </div>

                  {/* Quality */}
                  <div>
                    <label className="block text-neutral-400 font-bold uppercase tracking-wider mb-1">
                      Quality
                    </label>
                    <select
                      value={formData.quality}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, quality: e.target.value as any }))
                      }
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#DC143C]"
                    >
                      <option value="1080p">1080p</option>
                      <option value="720p">720p</option>
                      <option value="480p">480p</option>
                      <option value="Auto">Auto</option>
                    </select>
                  </div>

                  {/* Audio */}
                  <div>
                    <label className="block text-neutral-400 font-bold uppercase tracking-wider mb-1">
                      Audio / Sub
                    </label>
                    <select
                      value={formData.subDub}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, subDub: e.target.value as any }))
                      }
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#DC143C]"
                    >
                      <option value="SUB">Subbed</option>
                      <option value="DUB">Dubbed</option>
                      <option value="BOTH">Dual Audio</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-[#DC143C] hover:bg-[#b01030] text-white text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2 shadow-lg shadow-[#DC143C]/20"
                  >
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>{editingVideo ? 'Save Changes' : 'Create Stream'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="w-12 h-12 rounded-xl bg-red-950/60 border border-red-500/30 text-red-400 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase italic text-white">
                Delete Video Stream
              </h3>
              <p className="text-xs text-neutral-400 mt-2">
                Are you sure you want to remove the video stream for <span className="text-white font-bold">{deleteTarget.animeTitle} - Episode {deleteTarget.episodeNumber}</span>?
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
