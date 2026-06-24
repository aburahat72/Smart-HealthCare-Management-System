import { useState } from 'react';
import { Camera } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { getPatientImage } from '../../utils/helpers';
import toast, { Toaster } from 'react-hot-toast';

export default function ProfilePage({ role: propRole }) {
  const { user, updateUser } = useAuth();
  const role = propRole || user?.role;
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    gender: user?.gender || '',
    specialization: user?.doctorProfile?.specialization || '',
    experience: user?.doctorProfile?.experience || '',
    consultationFee: user?.doctorProfile?.consultationFee || '',
    bio: user?.doctorProfile?.bio || '',
    profileImage: user?.profileImage || '',
  });

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm({ ...form, profileImage: data.fileUrl });
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data);
      setEditing(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Profile" subtitle="View and edit your profile information.">
      <Toaster position="top-right" />
      <div className="mx-auto max-w-2xl">
        <div className="card">
          <div className="flex flex-col items-center">
            <div className="relative">
              <img src={form.profileImage || getPatientImage(user)} alt="" className="h-28 w-28 rounded-full object-cover ring-4 ring-primary-50" />
              {editing && (
                <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white">
                  <Camera className="h-4 w-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                </label>
              )}
            </div>
            <h2 className="mt-4 text-xl font-bold">{user?.name}</h2>
            <p className="text-sm capitalize text-gray-500">{user?.role}</p>
          </div>

          <div className="mt-8 space-y-4">
            {[
              { key: 'name', label: 'Full Name' },
              { key: 'email', label: 'Email', disabled: true },
              { key: 'phone', label: 'Phone' },
              { key: 'address', label: 'Address' },
            ].map((field) => (
              <div key={field.key}>
                <label className="mb-1 block text-sm font-semibold text-gray-700">{field.label}</label>
                <input
                  className="input-field"
                  value={form[field.key]}
                  disabled={!editing || field.disabled}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                />
              </div>
            ))}

            {role === 'doctor' && (
              <>
                {[
                  { key: 'specialization', label: 'Specialization' },
                  { key: 'experience', label: 'Experience (Years)', type: 'number' },
                  { key: 'consultationFee', label: 'Consultation Fee (₹)', type: 'number' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">{field.label}</label>
                    <input
                      className="input-field"
                      type={field.type || 'text'}
                      value={form[field.key]}
                      disabled={!editing}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    />
                  </div>
                ))}
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Bio</label>
                  <textarea className="input-field" value={form.bio} disabled={!editing} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                </div>
              </>
            )}
          </div>

          <div className="mt-8 flex gap-3">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : 'Save Changes'}</button>
                <button onClick={() => setEditing(false)} className="btn-outline flex-1">Cancel</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="btn-primary w-full">Edit Profile</button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
