import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import DownloadReceiptButton from '../../components/DownloadReceiptButton';
import api from '../../api/axios';
import { formatDateTime, getDoctorName, getPatientName } from '../../utils/helpers';
import toast, { Toaster } from 'react-hot-toast';

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({ status: '', doctorId: '', date: '', time: '', tokenNumber: '' });

  useEffect(() => {
    api.get('/appointments', { params: { search, status } }).then((res) => setAppointments(res.data.appointments));
  }, [search, status]);

  useEffect(() => {
    api.get('/doctors/admin/all').then((res) => setDoctors(res.data.doctors));
  }, []);

  const refresh = () => api.get('/appointments', { params: { search, status } }).then((res) => setAppointments(res.data.appointments));

  const openDetails = (appointment) => {
    setSelected(appointment);
    setEditForm({
      status: appointment.status || 'pending',
      doctorId: appointment.doctorId?._id || '',
      date: appointment.date ? new Date(appointment.date).toISOString().split('T')[0] : '',
      time: appointment.time || '',
      tokenNumber: appointment.tokenNumber || '',
    });
  };

  const updateAppointment = async (payload = editForm) => {
    try {
      const { data } = await api.put(`/appointments/${selected._id}`, payload);
      toast.success('Appointment updated');
      setSelected(data);
      setEditForm({
        status: data.status || 'pending',
        doctorId: data.doctorId?._id || '',
        date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
        time: data.time || '',
        tokenNumber: data.tokenNumber || '',
      });
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const resetTokens = async () => {
    try {
      await api.post('/appointments/tokens/reset', { doctorId: editForm.doctorId, date: editForm.date });
      toast.success('Tokens reset');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Token reset failed');
    }
  };

  const regenerateReceipt = async (id) => {
    try {
      const { data } = await api.post(`/receipts/${id}/regenerate`, {}, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to regenerate receipt');
    }
  };

  return (
    <DashboardLayout title="Manage Appointments" subtitle="View, search, and filter all appointments.">
      <Toaster position="top-right" />
      <div className="card">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input className="input-field pl-11" placeholder="Search appointments..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input-field sm:w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending - Admin Review</option>
            <option value="upcoming">Upcoming - Doctor Can Complete</option>
            <option value="completed">Completed - Final Status</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="pb-3 pr-4">Reference</th>
                <th className="pb-3 pr-4">Patient</th>
                <th className="pb-3 pr-4">Doctor</th>
                <th className="pb-3 pr-4">Date/Time</th>
                <th className="pb-3 pr-4">Token</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a._id} className="border-b border-gray-50">
                  <td className="py-4 pr-4 font-mono text-xs">{a.referenceId || '-'}</td>
                  <td className="py-4 pr-4 font-medium">{getPatientName(a.patientId)}</td>
                  <td className="py-4 pr-4">{getDoctorName(a.doctorId)}</td>
                  <td className="py-4 pr-4 text-gray-500">{formatDateTime(a.date, a.time)}</td>
                  <td className="py-4 pr-4 font-semibold">{a.tokenNumber || '-'}</td>
                  <td className="py-4 pr-4"><StatusBadge status={a.status} /></td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openDetails(a)} className="btn-action text-primary-500 hover:bg-primary-50">View</button>
                      <button onClick={() => regenerateReceipt(a._id)} className="btn-action text-gray-500 hover:bg-gray-100">Receipt</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="card max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Appointment Details</h3>
            <div className="mt-4 space-y-2 text-sm">
              <p><strong>Reference:</strong> {selected.referenceId}</p>
              <p><strong>Patient:</strong> {getPatientName(selected.patientId)}</p>
              <p><strong>Doctor:</strong> {getDoctorName(selected.doctorId)}</p>
              <p><strong>Date:</strong> {formatDateTime(selected.date, selected.time)}</p>
              <p><strong>Token:</strong> {selected.tokenNumber || '-'}</p>
              <p><strong>Status:</strong> <StatusBadge status={selected.status} /></p>
              <p><strong>Payment:</strong> <span className="capitalize">{selected.paymentStatus?.replace('_', ' ')}</span></p>
              <p><strong>Fee:</strong> ₹{selected.consultationFee}</p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <select className="input-field" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                <option value="pending">Pending - Admin Review</option>
                <option value="upcoming">Upcoming - Doctor Can Complete</option>
                <option value="completed">Completed - Final Status</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
              <select className="input-field" value={editForm.doctorId} onChange={(e) => setEditForm({ ...editForm, doctorId: e.target.value })}>
                {doctors.map((doctor) => <option key={doctor._id} value={doctor._id}>{getDoctorName(doctor)}</option>)}
              </select>
              <input className="input-field" type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} />
              <input className="input-field" value={editForm.time} placeholder="Time" onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} />
              <input className="input-field" type="number" min="0" value={editForm.tokenNumber} placeholder="Token" onChange={(e) => setEditForm({ ...editForm, tokenNumber: e.target.value })} />
              <button onClick={resetTokens} className="btn-outline py-2 text-xs">Reset Doctor Tokens</button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => updateAppointment({ ...editForm, status: 'upcoming' })} className="btn-action bg-green-50 text-green-600 hover:bg-green-100">Approve</button>
              <button onClick={() => updateAppointment({ ...editForm, status: 'cancelled' })} className="btn-action bg-red-50 text-red-600 hover:bg-red-100">Cancel</button>
              <button onClick={() => updateAppointment(editForm)} className="btn-action bg-primary-50 text-primary-500 hover:bg-primary-100">Save Changes</button>
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
