import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, Users } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import api from '../../api/axios';
import { formatDateTime, getPatientImage, getPatientName } from '../../utils/helpers';

export default function DoctorDashboard() {
  const [stats, setStats] = useState({ today: 0, upcoming: 0, completed: 0, totalPatients: 0 });
  const [todayAppts, setTodayAppts] = useState([]);

  useEffect(() => {
    api.get('/appointments/stats').then((res) => setStats(res.data));
    api.get('/appointments').then((res) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const filtered = res.data.appointments.filter((a) => {
        const d = new Date(a.date);
        return d >= today && d < tomorrow && !['cancelled', 'rejected'].includes(a.status);
      });
      setTodayAppts(filtered);
    });
  }, []);

  return (
    <DashboardLayout title="Doctor Dashboard" subtitle="Manage your appointments and patients.">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Today's Appointments" value={stats.today} icon={Calendar} color="teal" />
        <StatCard title="Upcoming" value={stats.upcoming} icon={Clock} color="blue" />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircle} color="green" />
        <StatCard title="Total Patients" value={stats.totalPatients} icon={Users} color="purple" />
      </div>

      <div className="card mt-8">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Today&apos;s Appointments</h3>
          <Link to="/doctor/appointments" className="text-sm font-medium text-primary-500">View All</Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="pb-3 pr-4">Patient</th>
                <th className="pb-3 pr-4">Time</th>
                <th className="pb-3 pr-4">Reason</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {todayAppts.map((a) => (
                <tr key={a._id} className="border-b border-gray-50">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <img src={getPatientImage(a.patientId)} alt="" className="h-10 w-10 rounded-full object-cover" />
                      <span className="font-medium">{getPatientName(a.patientId)}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-gray-500">{a.time}</td>
                  <td className="py-4 pr-4 text-gray-500">{a.symptoms || a.reason || 'N/A'}</td>
                  <td className="py-4 pr-4"><StatusBadge status={a.status} /></td>
                  <td className="py-4">
                    <Link to="/doctor/appointments" className="text-sm font-medium text-primary-500">View</Link>
                  </td>
                </tr>
              ))}
              {todayAppts.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">No appointments today</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
