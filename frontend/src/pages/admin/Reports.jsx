import { useEffect, useState } from 'react';
import { BarChart3, Users, UserCheck, Calendar } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/axios';

export default function Reports() {
  const [reports, setReports] = useState(null);

  useEffect(() => {
    api.get('/ai/reports').then((res) => setReports(res.data));
  }, []);

  if (!reports) return null;

  return (
    <DashboardLayout title="Reports" subtitle="View appointment, doctor, and patient statistics.">
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="card text-center">
          <Calendar className="mx-auto h-10 w-10 text-primary-500" />
          <p className="mt-3 text-3xl font-bold">{reports.appointmentStats?.total || 0}</p>
          <p className="text-sm text-gray-500">Total Appointments</p>
        </div>
        <div className="card text-center">
          <UserCheck className="mx-auto h-10 w-10 text-purple-500" />
          <p className="mt-3 text-3xl font-bold">{reports.doctorStats?.total || 0}</p>
          <p className="text-sm text-gray-500">Total Doctors</p>
        </div>
        <div className="card text-center">
          <Users className="mx-auto h-10 w-10 text-green-500" />
          <p className="mt-3 text-3xl font-bold">{reports.patientStats?.total || 0}</p>
          <p className="text-sm text-gray-500">Total Patients</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="flex items-center gap-2 font-bold text-gray-900"><BarChart3 className="h-5 w-5 text-primary-500" /> Appointment Statistics</h3>
          <div className="mt-4 space-y-3">
            {Object.entries(reports.appointmentStats?.byStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="capitalize text-gray-600">{status}</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-32 rounded-full bg-gray-100">
                    <div className="h-2 rounded-full bg-primary-500" style={{ width: `${(count / reports.appointmentStats.total) * 100}%` }} />
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="flex items-center gap-2 font-bold text-gray-900"><UserCheck className="h-5 w-5 text-purple-500" /> Doctor Statistics</h3>
          <div className="mt-4 space-y-3">
            {Object.entries(reports.doctorStats?.bySpecialization || {}).map(([spec, count]) => (
              <div key={spec} className="flex items-center justify-between">
                <span className="text-gray-600">{spec}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
