import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, Calendar, Clock } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import api from '../../api/axios';
import { formatDateTime, getDoctorName, getPatientName } from '../../utils/helpers';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    api.get('/appointments/stats').then((res) => setStats(res.data));
    api.get('/appointments?limit=5').then((res) => setAppointments(res.data.appointments));
  }, []);

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Overview of the healthcare system.">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Doctors" value={stats.totalDoctors || 0} icon={UserCheck} color="purple" />
        <StatCard title="Total Patients" value={stats.totalPatients || 0} icon={Users} color="blue" />
        <StatCard title="Total Appointments" value={stats.totalAppointments || 0} icon={Calendar} color="green" />
        <StatCard title="Today's Appointments" value={stats.todayAppointments || 0} icon={Clock} color="orange" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h3 className="font-bold text-gray-900">Recent Appointments</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="pb-3 pr-4">Patient</th>
                  <th className="pb-3 pr-4">Doctor</th>
                  <th className="pb-3 pr-4">Date/Time</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a._id} className="border-b border-gray-50">
                    <td className="py-3 pr-4">{getPatientName(a.patientId)}</td>
                    <td className="py-3 pr-4">{getDoctorName(a.doctorId)}</td>
                    <td className="py-3 pr-4 text-gray-500">{formatDateTime(a.date, a.time)}</td>
                    <td className="py-3"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-gray-900">Quick Actions</h3>
          <div className="mt-4 space-y-2">
            {[
              { to: '/admin/doctors', label: 'Add Doctor' },
              { to: '/admin/patients', label: 'Manage Patients' },
              { to: '/admin/appointments', label: 'Manage Appointments' },
              { to: '/admin/reports', label: 'View Reports' },
            ].map((a) => (
              <Link key={a.to} to={a.to} className="flex items-center justify-between rounded-xl border border-gray-100 p-4 text-sm font-medium transition hover:bg-gray-50">
                {a.label} <span className="text-primary-500">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
