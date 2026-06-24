import { useEffect, useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, GripVertical, Image, Upload } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { getMediaUrl } from '../../utils/helpers';

/** Admin Hero Slider Management — add, edit, delete, reorder slides */
export default function ManageHero() {
  const [slides, setSlides] = useState([]);
  const [slideInterval, setSlideInterval] = useState(5);
  const [form, setForm] = useState({ title: '', description: '', image: '' });
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetch = () => {
    api.get('/hero/admin').then((res) => {
      setSlides(res.data.slides);
      setSlideInterval(res.data.slideInterval);
    });
  };

  useEffect(() => { fetch(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/hero/${editing}`, form);
        toast.success('Slide updated');
      } else {
        await api.post('/hero', { ...form, order: slides.length });
        toast.success('Slide added');
      }
      setForm({ title: '', description: '', image: '' });
      setEditing(null);
      setShowForm(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this slide?')) return;
    await api.delete(`/hero/${id}`);
    toast.success('Slide deleted');
    fetch();
  };

  const moveSlide = async (index, direction) => {
    const newSlides = [...slides];
    const target = index + direction;
    if (target < 0 || target >= newSlides.length) return;
    [newSlides[index], newSlides[target]] = [newSlides[target], newSlides[index]];
    await api.put('/hero/reorder', { slideIds: newSlides.map((s) => s._id) });
    fetch();
  };

  const saveInterval = async () => {
    await api.put('/hero/settings', { heroSlideInterval: slideInterval });
    toast.success('Slide interval updated');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm({ ...form, image: data.fileUrl });
      toast.success('Hero image uploaded');
    } catch {
      toast.error('Image upload failed');
    }
  };

  const startEdit = (slide) => {
    setForm({ title: slide.title, description: slide.description, image: slide.image });
    setEditing(slide._id);
    setShowForm(true);
  };

  return (
    <DashboardLayout title="Hero Slider Management" subtitle="Manage landing page hero slides and timing.">
      <Toaster position="top-right" />

      {/* Slide interval control */}
      <div className="card mb-6">
        <h3 className="font-bold text-gray-900">Auto-Slide Timing</h3>
        <div className="mt-4 flex items-center gap-4">
          <input
            type="number"
            min={2}
            max={30}
            className="input-field w-24"
            value={slideInterval}
            onChange={(e) => setSlideInterval(Number(e.target.value))}
          />
          <span className="text-sm text-gray-500">seconds</span>
          <button onClick={saveInterval} className="btn-primary py-2 text-xs">Save Interval</button>
        </div>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="card mb-6">
          <h3 className="font-bold text-gray-900">{editing ? 'Edit Slide' : 'Add New Slide'}</h3>
          <form onSubmit={handleSave} className="mt-4 space-y-4">
            <input className="input-field" placeholder="Title (e.g. Your Health, Our Priority)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <input className="input-field" placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input className="input-field" placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} required />
              <label className="btn-outline cursor-pointer py-2 text-xs">
                <Upload className="h-4 w-4" /> Upload Image
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            {form.image && <img src={getMediaUrl(form.image)} alt="" className="h-32 rounded-xl object-cover" />}
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">{editing ? 'Update' : 'Add Slide'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm({ title: '', description: '', image: '' }); }} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Slides list */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Slides ({slides.length})</h3>
          <button onClick={() => { setShowForm(true); setEditing(null); setForm({ title: '', description: '', image: '' }); }} className="btn-primary py-2 text-xs">
            <Plus className="h-4 w-4" /> Add Slide
          </button>
        </div>

        <div className="space-y-3">
          {slides.map((slide, i) => (
            <div key={slide._id} className="flex items-center gap-4 rounded-xl border border-gray-100 p-4">
              <GripVertical className="h-5 w-5 shrink-0 text-gray-300" />
              {slide.image ? (
                <img src={getMediaUrl(slide.image)} alt="" className="h-16 w-12 rounded-lg object-cover" />
              ) : (
                <div className="flex h-16 w-12 items-center justify-center rounded-lg bg-gray-100"><Image className="h-5 w-5 text-gray-400" /></div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{slide.title}</p>
                <p className="text-xs text-gray-500 truncate">{slide.description}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => moveSlide(i, -1)} disabled={i === 0} className="rounded p-1 hover:bg-gray-100 disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button>
                <button onClick={() => moveSlide(i, 1)} disabled={i === slides.length - 1} className="rounded p-1 hover:bg-gray-100 disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button>
                <button onClick={() => startEdit(slide)} className="btn-action text-primary-500 hover:bg-primary-50">Edit</button>
                <button onClick={() => handleDelete(slide._id)} className="rounded-full p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {slides.length === 0 && (
            <p className="py-8 text-center text-gray-400">No slides yet. Add your first hero slide.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
