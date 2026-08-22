import React, { useState, useEffect } from 'react';
import {
  Tag,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Hash,
  Palette,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { genreService } from '../../services/videoService';
import { GenreItem } from '../../types/anime';

export const AdminGenresPage: React.FC = () => {
  const [genres, setGenres] = useState<GenreItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add/Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingGenre, setEditingGenre] = useState<GenreItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#DC143C',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GenreItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadGenres = async () => {
    setIsLoading(true);
    try {
      const data = await genreService.getAllGenres();
      setGenres(data);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGenres();
  }, []);

  const handleOpenAdd = () => {
    setEditingGenre(null);
    setFormData({
      name: '',
      description: '',
      color: '#DC143C',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (g: GenreItem) => {
    setEditingGenre(g);
    setFormData({
      name: g.name,
      description: g.description,
      color: g.color || '#DC143C',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingGenre) {
        const res = await genreService.updateGenre(editingGenre.id, formData);
        if (res.success) {
          setGenres((prev) =>
            prev.map((g) => (g.id === editingGenre.id ? { ...g, ...formData } : g))
          );
          setActionMessage(`Genre "${formData.name}" updated successfully.`);
          setShowModal(false);
        }
      } else {
        const res = await genreService.createGenre(formData);
        if (res.success && res.data) {
          setGenres((prev) => [...prev, res.data!]);
          setActionMessage(`Genre "${formData.name}" created successfully.`);
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
      const res = await genreService.deleteGenre(deleteTarget.id);
      if (res.success) {
        setGenres((prev) => prev.filter((g) => g.id !== deleteTarget.id));
        setActionMessage(`Genre "${deleteTarget.name}" deleted.`);
        setTimeout(() => setActionMessage(null), 4000);
      }
      setDeleteTarget(null);
    } catch {
      // Handled
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredGenres = genres.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#DC143C] bg-[#DC143C]/10 border border-[#DC143C]/20 px-2.5 py-0.5 rounded-md">
                Taxonomy & Tags
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight text-white">
              Genre Management
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Organize catalog classifications, descriptions, and color accents ({filteredGenres.length} genres)
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            id="admin-add-genre-btn"
            className="inline-flex items-center gap-2 bg-[#DC143C] hover:bg-[#b01030] active:scale-[0.98] text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-lg shadow-[#DC143C]/20 transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add New Genre</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {actionMessage && (
          <div className="bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search genres by name or description..."
              className="w-full bg-[#181818] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#DC143C]"
            />
          </div>
        </div>

        {/* Genres Grid / Table */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#DC143C] animate-spin" />
              <span className="text-xs text-neutral-400 font-medium">Loading genre catalog...</span>
            </div>
          ) : filteredGenres.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <Tag className="w-10 h-10 text-neutral-600 mb-3" />
              <h3 className="text-base font-bold text-white uppercase">No genres found</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                Add a new genre classification to categorize your anime collection.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161616] text-neutral-400 uppercase tracking-wider text-[10px] font-bold border-b border-white/5">
                  <tr>
                    <th className="py-3.5 px-4">Genre Name</th>
                    <th className="py-3.5 px-4">Slug Identifier</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Anime Count</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-neutral-300">
                  {filteredGenres.map((genre) => (
                    <tr key={genre.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Name + Color swatch */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: genre.color || '#DC143C' }}
                          />
                          <span className="font-bold text-white text-sm">{genre.name}</span>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-400">
                        /{genre.slug}
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 text-neutral-400 max-w-sm truncate">
                        {genre.description || 'No description provided.'}
                      </td>

                      {/* Anime Count */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 font-mono text-[11px] text-white">
                          {genre.animeCount ?? 0} Anime
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(genre)}
                            className="p-2 text-neutral-400 hover:text-[#DC143C] rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            title="Edit Genre"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(genre)}
                            className="p-2 text-neutral-400 hover:text-red-400 rounded-lg bg-white/5 hover:bg-red-950/40 transition-colors"
                            title="Delete Genre"
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

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-lg font-black uppercase italic text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-[#DC143C]" />
                  <span>{editingGenre ? 'Edit Genre' : 'Add New Genre'}</span>
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-400 font-bold uppercase tracking-wider mb-1">
                    Genre Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Cyberpunk, Isekai, Romance"
                    required
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#DC143C]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-bold uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    rows={3}
                    placeholder="Brief description of this genre category..."
                    className="w-full bg-[#181818] border border-white/10 rounded-xl p-3 text-white placeholder-neutral-500 focus:outline-none focus:border-[#DC143C]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-bold uppercase tracking-wider mb-1">
                    Theme Color Accent
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                      className="flex-1 bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono uppercase focus:outline-none focus:border-[#DC143C]"
                    />
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
                    <span>{editingGenre ? 'Save Changes' : 'Create Genre'}</span>
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
                Delete Genre Confirmation
              </h3>
              <p className="text-xs text-neutral-400 mt-2">
                Are you sure you want to delete the genre <span className="text-white font-bold">"{deleteTarget.name}"</span>?
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
