import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import DownloadReceiptButton from '../../components/DownloadReceiptButton';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { formatDateTime, getDoctorImage, getDoctorName } from '../../utils/helpers';

const tabs = ['all', 'upcoming', 'completed', 'cancelled'];

export default function MyAppointments() {
  const [tab, setTab] = useState('all');
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);

  const fetch = () => {
    api.get('/appointments', { params: { status: tab } }).then((res) => setAppointments(res.data.appointments));
  };

  useEffect(() => { fetch(); }, [tab]);

  const cancelAppointment = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.put(`/appointments/${id}`, { status: 'cancelled' });
      toast.success('Appointment cancelled');
      fetch();
      setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  return (
    <DashboardLayout title="My Appointments" subtitle="View and manage your appointments.">
      <Toaster position="top-right" />
      <div className="card">
        <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${tab === t ? 'bg-primary-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="pb-3 pr-4">Reference</th>
                <th className="pb-3 pr-4">Doctor</th>
                <th className="pb-3 pr-4">Date/Time</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a._id} className="border-b border-gray-50">
                  <td className="py-4 pr-4 font-mono text-xs text-gray-500">{a.referenceId || '—'}</td>
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
                    <div className="flex gap-2">
                      <button onClick={() => setSelected(a)} className="text-sm font-medium text-primary-500">View</button>
                      {['pending', 'accepted', 'upcoming'].includes(a.status) && (
                        <button onClick={() => cancelAppointment(a._id)} className="text-sm font-medium text-red-500">Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">No appointments found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="card max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Appointment Details</h3>
            <div className="mt-4 space-y-3 text-sm">
              <p><span className="font-semibold">Reference:</span> {selected.referenceId}</p>
              <p><span className="font-semibold">Doctor:</span> {getDoctorName(selected.doctorId)}</p>
              <p><span className="font-semibold">Specialization:</span> {selected.doctorId?.specialization}</p>
              <p><span className="font-semibold">Date/Time:</span> {formatDateTime(selected.date, selected.time)}</p>
              <p><span className="font-semibold">Status:</span> <StatusBadge status={selected.status} /></p>
              <p><span className="font-semibold">Payment:</span> <span className="capitalize">{selected.paymentStatus?.replace('_', ' ')}</span></p>
              <p><span className="font-semibold">Symptoms:</span> {selected.symptoms || 'N/A'}</p>
              <p><span className="font-semibold">Fee:</span> ₹{selected.consultationFee}</p>
            </div>
            <div className="mt-6 flex gap-2">
              <DownloadReceiptButton appointmentId={selected._id} className="flex-1" />
              <button onClick={() => setSelected(null)} className="btn-outline flex-1">Close</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
