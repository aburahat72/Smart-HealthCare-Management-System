import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Camera } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { getDoctorImage, getDoctorName } from '../../utils/helpers';

const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const splitList = (value) => value.split(',').map((item) => item.trim()).filter(Boolean);

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: '', email: '', password: '', specialization: '', experience: '', consultationFee: '', image: '',
    availableDays: [], availableTimes: '', tokenLimit: 20, bookingCapacity: 20, isActive: true,
  });

  const emptyForm = {
    name: '', email: '', password: '', specialization: '', experience: '', consultationFee: '', image: '',
    availableDays: [], availableTimes: '', tokenLimit: 20, bookingCapacity: 20, isActive: true,
  };

  const fetch = () => api.get('/doctors/admin/all').then((res) => setDoctors(res.data.doctors));

  useEffect(() => { fetch(); }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm({ ...form, image: data.fileUrl });
      toast.success('Photo uploaded');
    } catch {
      toast.error('Photo upload failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/doctors/${editId}`, { ...form, availableTimes: splitList(form.availableTimes) });
        toast.success('Doctor updated');
      } else {
        await api.post('/doctors', { ...form, availableTimes: splitList(form.availableTimes) });
        toast.success('Doctor added');
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (doc) => {
    setEditId(doc._id);
    setForm({
      name: getDoctorName(doc),
      email: doc.userId?.email || '',
      specialization: doc.specialization,
      experience: doc.experience,
      consultationFee: doc.consultationFee,
      image: doc.image || doc.userId?.profileImage || '',
      availableDays: doc.availableDays || [],
      availableTimes: (doc.availableTimes || []).join(', '),
      tokenLimit: doc.tokenLimit ?? 20,
      bookingCapacity: doc.bookingCapacity ?? 20,
      isActive: doc.isActive !== false,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this doctor?')) return;
    try {
      await api.delete(`/doctors/${id}`);
      toast.success('Doctor deleted');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const toggleDay = (day) => {
    const exists = form.availableDays.includes(day);
    setForm({
      ...form,
      availableDays: exists
        ? form.availableDays.filter((item) => item !== day)
        : [...form.availableDays, day],
    });
  };

  return (
    <DashboardLayout title="Manage Doctors" subtitle="Add, edit, and delete doctors.">
      <Toaster position="top-right" />
      <div className="mb-6 flex justify-end">
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Doctor
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h3 className="font-bold">{editId ? 'Edit Doctor' : 'Add New Doctor'}</h3>
          <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 p-4">
              <img src={form.image || 'https://ui-avatars.com/api/?name=Doctor&background=0056D2&color=fff'} alt="" className="h-24 w-24 rounded-full object-cover ring-4 ring-primary-50" />
              <label className="btn-outline cursor-pointer py-2 text-xs">
                <Camera className="h-4 w-4" /> {editId ? 'Change Doctor Photo' : 'Upload Doctor Photo'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <input className="input-field" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="input-field" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={!!editId} />
            {!editId && <input className="input-field" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />}
            <input className="input-field" placeholder="Specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} required />
            <input className="input-field" type="number" placeholder="Experience (years)" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
            <input className="input-field" type="number" placeholder="Consultation Fee" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: e.target.value })} />
            <input className="input-field" type="number" min="0" placeholder="Daily Token Limit" value={form.tokenLimit} onChange={(e) => setForm({ ...form, tokenLimit: e.target.value })} />
            <input className="input-field" type="number" min="0" placeholder="Daily Booking Capacity" value={form.bookingCapacity} onChange={(e) => setForm({ ...form, bookingCapacity: e.target.value })} />
            <input className="input-field sm:col-span-2" placeholder="Available Times (comma separated, e.g. 09:00 AM, 10:30 AM)" value={form.availableTimes} onChange={(e) => setForm({ ...form, availableTimes: e.target.value })} />
            <div className="sm:col-span-2">
              <p className="mb-2 text-sm font-semibold text-gray-700">Available Days</p>
              <div className="flex flex-wrap gap-2">
                {dayOptions.map((day) => (
                  <button key={day} type="button" onClick={() => toggleDay(day)} className={`btn-action ${form.availableDays.includes(day) ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Active for booking
            </label>
            <div className="flex gap-2 sm:col-span-2">
              <button type="submit" className="btn-primary">{editId ? 'Update' : 'Add'} Doctor</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="pb-3 pr-4">Doctor</th>
              <th className="pb-3 pr-4">Specialization</th>
              <th className="pb-3 pr-4">Experience</th>
              <th className="pb-3 pr-4">Fee</th>
              <th className="pb-3 pr-4">Capacity</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doc) => (
              <tr key={doc._id} className="border-b border-gray-50">
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <img src={getDoctorImage(doc)} alt="" className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <p className="font-medium">{getDoctorName(doc)}</p>
                      <p className="text-xs text-gray-400">{doc.userId?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 pr-4 text-primary-500">{doc.specialization}</td>
                <td className="py-4 pr-4">{doc.experience} Years</td>
                <td className="py-4 pr-4 font-semibold text-green-600">₹{doc.consultationFee}</td>
                <td className="py-4 pr-4 text-gray-500">{doc.bookingCapacity || 0}/{doc.tokenLimit || 0}</td>
                <td className="py-4 pr-4">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${doc.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {doc.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(doc)} className="rounded-full border border-blue-200 p-2 text-blue-500 hover:bg-blue-50"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(doc._id)} className="rounded-full border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
