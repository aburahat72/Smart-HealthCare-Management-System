import { useEffect, useState } from 'react';
import { Lock, Bell, Shield, Save } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export default function SettingsPage({ role: propRole }) {
  const { user, updateUser } = useAuth();
  const role = propRole || user?.role;

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [prefs, setPrefs] = useState({
    appointmentAlerts: true,
    systemAlerts: true,
    emailAlerts: true,
  });
  const [regSettings, setRegSettings] = useState({
    allowPatientRegistration: true,
    allowDoctorRegistration: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.notificationPreferences) {
      setPrefs({ ...prefs, ...user.notificationPreferences });
    }
    if (role === 'admin') {
      api.get('/settings').then((res) => {
        setRegSettings({
          allowPatientRegistration: res.data.allowPatientRegistration,
          allowDoctorRegistration: res.data.allowDoctorRegistration,
        });
      });
    }
  }, [user, role]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handlePrefsSave = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', { notificationPreferences: prefs });
      updateUser(data);
      toast.success('Notification preferences saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleRegSettingsSave = async () => {
    setLoading(true);
    try {
      await api.put('/settings', regSettings);
      toast.success('Registration settings updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account security and preferences.">
      <Toaster position="top-right" />
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Change Password */}
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-500">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Change Password</h3>
              <p className="text-sm text-gray-500">Update your account password</p>
            </div>
          </div>
          <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Current Password</label>
              <input className="input-field" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">New Password</label>
              <input className="input-field" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required minLength={6} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Confirm New Password</label>
              <input className="input-field" type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              <Save className="h-4 w-4" /> Update Password
            </button>
          </form>
        </div>

        {/* Notification Preferences */}
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Notification Preferences</h3>
              <p className="text-sm text-gray-500">Choose what notifications you receive</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {[
              { key: 'appointmentAlerts', label: 'Appointment Alerts', desc: 'Get notified about appointment updates' },
              { key: 'systemAlerts', label: 'System Alerts', desc: 'Receive system and account notifications' },
              { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive important alerts via email' },
            ].map((item) => (
              <label key={item.key} className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-100 p-4 hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs[item.key]}
                  onChange={(e) => setPrefs({ ...prefs, [item.key]: e.target.checked })}
                  className="h-5 w-5 rounded border-gray-300 text-primary-500"
                />
              </label>
            ))}
            <button onClick={handlePrefsSave} disabled={loading} className="btn-primary">
              <Save className="h-4 w-4" /> Save Preferences
            </button>
          </div>
        </div>

        {/* Admin Registration Control */}
        {role === 'admin' && (
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-500">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Registration Control</h3>
                <p className="text-sm text-gray-500">Control who can register on the platform</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-100 p-4 hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">Allow Patient Registration</p>
                  <p className="text-sm text-gray-500">Patients can create new accounts</p>
                </div>
                <input
                  type="checkbox"
                  checked={regSettings.allowPatientRegistration}
                  onChange={(e) => setRegSettings({ ...regSettings, allowPatientRegistration: e.target.checked })}
                  className="h-5 w-5 rounded border-gray-300 text-primary-500"
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-100 p-4 hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">Allow Doctor Registration</p>
                  <p className="text-sm text-gray-500">Doctors can create new accounts</p>
                </div>
                <input
                  type="checkbox"
                  checked={regSettings.allowDoctorRegistration}
                  onChange={(e) => setRegSettings({ ...regSettings, allowDoctorRegistration: e.target.checked })}
                  className="h-5 w-5 rounded border-gray-300 text-primary-500"
                />
              </label>
              <button onClick={handleRegSettingsSave} disabled={loading} className="btn-primary">
                <Save className="h-4 w-4" /> Save Registration Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
