import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { formatDateTime, getPatientImage, getPatientName } from '../../utils/helpers';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);

  const fetch = () => {
    api.get('/appointments').then((res) => setAppointments(res.data.appointments));
  };

  useEffect(() => { fetch(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      toast.success(`Appointment ${status}`);
      fetch();
      setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  return (
    <DashboardLayout title="Appointments" subtitle="Manage patient appointments.">
      <Toaster position="top-right" />
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="pb-3 pr-4">Patient</th>
              <th className="pb-3 pr-4">Date/Time</th>
              <th className="pb-3 pr-4">Symptoms</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a._id} className="border-b border-gray-50">
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <img src={getPatientImage(a.patientId)} alt="" className="h-10 w-10 rounded-full object-cover" />
                    <span className="font-medium">{getPatientName(a.patientId)}</span>
                  </div>
                </td>
                <td className="py-4 pr-4 text-gray-500">{formatDateTime(a.date, a.time)}</td>
                <td className="py-4 pr-4 text-gray-500 max-w-[200px] truncate">{a.symptoms || 'N/A'}</td>
                <td className="py-4 pr-4"><StatusBadge status={a.status} /></td>
                <td className="py-4">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setSelected(a)} className="btn-action text-primary-500 hover:bg-primary-50">View</button>
                    {a.status === 'upcoming' && (
                      <button onClick={() => updateStatus(a._id, 'completed')} className="text-sm text-blue-600">Complete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="card max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Appointment Details</h3>
            <div className="mt-4 space-y-2 text-sm">
              <p><span className="font-semibold">Reference:</span> {selected.referenceId || '-'}</p>
              <p><span className="font-semibold">Patient:</span> {getPatientName(selected.patientId)}</p>
              <p><span className="font-semibold">Phone:</span> {selected.patientId?.phone || 'N/A'}</p>
              <p><span className="font-semibold">Email:</span> {selected.patientId?.email || 'N/A'}</p>
              <p><span className="font-semibold">Date/Time:</span> {formatDateTime(selected.date, selected.time)}</p>
              <p><span className="font-semibold">Token:</span> {selected.tokenNumber || '-'}</p>
              <p><span className="font-semibold">Symptoms:</span> {selected.symptoms || 'N/A'}</p>
              <p><span className="font-semibold">Reason:</span> {selected.reason || 'N/A'}</p>
              <p><span className="font-semibold">Status:</span> <StatusBadge status={selected.status} /></p>
            </div>
            {selected.status === 'upcoming' && (
              <button onClick={() => updateStatus(selected._id, 'completed')} className="btn-primary mt-6 w-full">Mark Completed</button>
            )}
            <button onClick={() => setSelected(null)} className="btn-outline mt-6 w-full">Close</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
