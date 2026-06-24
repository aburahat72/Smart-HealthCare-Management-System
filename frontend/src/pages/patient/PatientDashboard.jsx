import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, XCircle, MapPin, Send } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime, getDoctorImage, getDoctorName } from '../../utils/helpers';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0, cancelled: 0 });
  const [appointments, setAppointments] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'user', text: 'I have headache and body pain.' },
    { role: 'ai', text: 'Based on your symptoms, you should consult the General Medicine department. Other possible departments: General Physician, Internal Medicine, Infectious Disease Specialist.' },
  ]);

  useEffect(() => {
    api.get('/appointments/stats').then((res) => setStats(res.data));
    api.get('/appointments?limit=5').then((res) => setAppointments(res.data.appointments));
  }, []);

  const upcoming = appointments.find((a) => ['pending', 'accepted', 'upcoming'].includes(a.status));

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setChatInput('');
    try {
      const { data } = await api.post('/ai/symptoms', { symptoms: msg });
      setChatMessages((prev) => [...prev, {
        role: 'ai',
        text: `${data.message} Other possible departments: ${data.otherDepartments.join(', ')}.`,
      }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: 'ai', text: 'Please consult General Medicine for your symptoms.' }]);
    }
  };

  return (
    <DashboardLayout title={`Welcome Back, ${user?.name} 👋`} subtitle="Take charge of your health and stay safe.">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Appointments" value={stats.total} subtitle="All Time" icon={Calendar} color="blue" />
        <StatCard title="Upcoming" value={stats.upcoming} subtitle="Next 7 Days" icon={Clock} color="green" />
        <StatCard title="Completed" value={stats.completed} subtitle="All Time" icon={CheckCircle} color="orange" />
        <StatCard title="Cancelled" value={stats.cancelled} subtitle="All Time" icon={XCircle} color="red" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {upcoming && (
            <div className="card">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Upcoming Appointment</h3>
                <Link to="/patient/appointments" className="text-sm font-medium text-primary-500">View All</Link>
              </div>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                <img src={getDoctorImage(upcoming.doctorId)} alt="" className="h-20 w-20 rounded-2xl object-cover" />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{getDoctorName(upcoming.doctorId)}</h4>
                  <p className="text-sm text-primary-500">{upcoming.doctorId?.specialization}</p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" /> {formatDateTime(upcoming.date, upcoming.time)}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" /> {upcoming.location}
                  </p>
                </div>
                <StatusBadge status="upcoming" />
              </div>
            </div>
          )}

          <div className="card overflow-hidden">
            <h3 className="font-bold text-gray-900">My Appointments</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="pb-3 pr-4">Doctor</th>
                    <th className="pb-3 pr-4">Date/Time</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 3).map((a) => (
                    <tr key={a._id} className="border-b border-gray-50">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <img src={getDoctorImage(a.doctorId)} alt="" className="h-10 w-10 rounded-full object-cover" />
                          <div>
                            <p className="font-medium">{getDoctorName(a.doctorId)}</p>
                            <p className="text-xs text-gray-400">{a.doctorId?.specialization}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-gray-500">{formatDateTime(a.date, a.time)}</td>
                      <td className="py-4 pr-4"><StatusBadge status={a.status} /></td>
                      <td className="py-4">
                        <Link to="/patient/appointments" className="text-sm font-medium text-primary-500">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link to="/patient/appointments" className="mt-4 block text-center text-sm font-medium text-primary-500">View All Appointments</Link>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-bold text-gray-900">Quick Actions</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { to: '/patient/book-appointment', label: 'Book Appointment', color: 'border-blue-200 text-blue-600' },
                { to: '/patient/book-appointment', label: 'Find Doctors', color: 'border-purple-200 text-purple-600' },
                { to: '/patient/medical-records', label: 'Medical Records', color: 'border-green-200 text-green-600' },
                { to: '/patient/ai-assistant', label: 'Chat with AI', color: 'border-orange-200 text-orange-600' },
              ].map((action) => (
                <Link key={action.label} to={action.to} className={`rounded-xl border-2 p-4 text-center text-xs font-semibold transition hover:shadow-md ${action.color}`}>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold text-gray-900">AI Health Assistant</h3>
            <div className="mt-4 max-h-48 space-y-3 overflow-y-auto">
              {chatMessages.map((m, i) => (
                <div key={i} className={`rounded-xl p-3 text-sm ${m.role === 'user' ? 'ml-8 bg-primary-500 text-white' : 'mr-8 bg-gray-100 text-gray-700'}`}>
                  {m.text}
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input className="input-field flex-1 py-2" placeholder="Type your symptoms..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendChat()} />
              <button onClick={sendChat} className="btn-primary px-4 py-2"><Send className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
