import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import NotificationDropdown from '../components/NotificationDropdown';
import { getPatientImage } from '../utils/helpers';

const patientLinks = [
  { to: '/patient/dashboard', label: 'Dashboard' },
  { to: '/patient/book-appointment', label: 'Book Appointment' },
  { to: '/patient/appointments', label: 'My Appointments' },
  { to: '/patient/ai-assistant', label: 'AI Health Assistant' },
  { to: '/patient/medical-records', label: 'Medical Records' },
  { to: '/patient/payments', label: 'Payment History' },
  { to: '/patient/profile', label: 'Profile' },
  { to: '/patient/settings', label: 'Settings' },
];

const doctorLinks = [
  { to: '/doctor/dashboard', label: 'Dashboard' },
  { to: '/doctor/appointments', label: 'Appointments' },
  { to: '/doctor/patients', label: 'Patients' },
  { to: '/doctor/profile', label: 'Profile' },
  { to: '/doctor/settings', label: 'Settings' },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/doctors', label: 'Manage Doctors' },
  { to: '/admin/patients', label: 'Manage Patients' },
  { to: '/admin/appointments', label: 'Manage Appointments' },
  { to: '/admin/payments', label: 'Payment Management' },
  { to: '/admin/hero', label: 'Hero Slider' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/profile', label: 'Profile' },
  { to: '/admin/settings', label: 'Settings' },
];

const linkIcons = {
  patient: patientLinks,
  doctor: doctorLinks,
  admin: adminLinks,
};

export default function DashboardLayout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const role = user?.role || 'patient';
  const links = linkIcons[role] || patientLinks;

  const sidebarBg = role === 'doctor' ? 'bg-teal-700' : role === 'admin' ? 'bg-purple-900' : 'bg-white border-r border-gray-100';
  const activeClass = role === 'patient'
    ? 'bg-primary-50 text-primary-500 font-semibold'
    : 'bg-white/20 text-white font-semibold';
  const linkClass = role === 'patient' ? 'text-gray-600 hover:bg-gray-50' : 'text-white/80 hover:bg-white/10';

  return (
    <div className="flex min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col ${sidebarBg} transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className={`flex items-center justify-between p-6 ${role === 'patient' ? '' : 'border-b border-white/10'}`}>
          <Logo showText light={role !== 'patient'} />
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className={role === 'patient' ? 'text-gray-600' : 'text-white'} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-4">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={`block rounded-xl px-4 py-3 text-sm transition ${location.pathname === link.to ? activeClass : linkClass}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {role === 'patient' && (
          <div className="mx-4 mb-4 rounded-2xl bg-primary-50 p-4">
            <p className="text-sm font-semibold text-primary-500">Need Help?</p>
            <p className="mt-1 text-xs text-gray-500">Our AI Assistant is here to help you anytime.</p>
            <Link to="/patient/ai-assistant" className="btn-primary mt-3 w-full py-2 text-xs">Chat Now</Link>
          </div>
        )}

        <div className="border-t border-gray-100 p-4">
          <button onClick={logout} className={`flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm ${role === 'patient' ? 'text-red-500 hover:bg-red-50' : 'text-white/80 hover:bg-white/10'}`}>
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 hover:bg-gray-100 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              {title && <h1 className="text-lg font-bold text-gray-900 lg:text-xl">{title}</h1>}
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-3 rounded-xl p-1 hover:bg-gray-50">
                <img src={getPatientImage(user)} alt="" className="h-10 w-10 rounded-full object-cover" />
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs capitalize text-gray-500">{user?.role}</p>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-gray-400 sm:block" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-100 bg-white py-2 shadow-card">
                  <Link to={`/${role}/profile`} className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setProfileOpen(false)}>Profile</Link>
                  <Link to={`/${role}/settings`} className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setProfileOpen(false)}>Settings</Link>
                  <button onClick={logout} className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50">Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
