import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { formatDateTime, getPatientName } from '../../utils/helpers';

const statuses = ['all', 'pending', 'completed', 'failed', 'refunded', 'cancelled'];

export default function ManagePayments() {
  const [payments, setPayments] = useState([]);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');

  const fetch = () => {
    api.get('/payments/history').then((res) => setPayments(res.data.payments));
  };

  useEffect(() => { fetch(); }, []);

  const visiblePayments = payments.filter((payment) => {
    const matchesStatus = status === 'all' || payment.status === status;
    const term = search.toLowerCase();
    const matchesSearch = !term ||
      payment.transactionId?.toLowerCase().includes(term) ||
      payment.appointmentId?.referenceId?.toLowerCase().includes(term) ||
      payment.patientId?.name?.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const statusColor = (value) => {
    if (value === 'completed') return 'text-green-600 bg-green-50';
    if (value === 'failed' || value === 'cancelled') return 'text-red-600 bg-red-50';
    if (value === 'refunded') return 'text-blue-600 bg-blue-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const updatePayment = async (payment, nextStatus) => {
    try {
      const { data } = await api.put(`/payments/${payment._id}/status`, { status: nextStatus, note });
      toast.success(`Payment marked ${nextStatus}`);
      setSelected(data);
      setNote('');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment update failed');
    }
  };

  return (
    <DashboardLayout title="Payment Management" subtitle="View and control all payment records.">
      <Toaster position="top-right" />
      <div className="card">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input className="input-field pl-11" placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input-field sm:w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
            {statuses.map((item) => <option key={item} value={item} className="capitalize">{item === 'all' ? 'All Status' : item}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="pb-3 pr-4">Transaction</th>
                <th className="pb-3 pr-4">Patient</th>
                <th className="pb-3 pr-4">Appointment</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visiblePayments.map((payment) => (
                <tr key={payment._id} className="border-b border-gray-50">
                  <td className="py-4 pr-4 font-mono text-xs">{payment.transactionId || payment._id.slice(-8)}</td>
                  <td className="py-4 pr-4 font-medium">{getPatientName(payment.patientId)}</td>
                  <td className="py-4 pr-4">{payment.appointmentId?.referenceId || '-'}</td>
                  <td className="py-4 pr-4 font-semibold">₹{payment.amount}</td>
                  <td className="py-4 pr-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${statusColor(payment.status)}`}>{payment.status}</span>
                  </td>
                  <td className="py-4 pr-4 text-gray-500">{formatDateTime(payment.createdAt)}</td>
                  <td className="py-4">
                    <button onClick={() => setSelected(payment)} className="btn-action text-primary-500 hover:bg-primary-50">Manage</button>
                  </td>
                </tr>
              ))}
              {visiblePayments.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400">No payments found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="card max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Payment Details</h3>
            <div className="mt-4 space-y-2 text-sm">
              <p><strong>Patient:</strong> {getPatientName(selected.patientId)}</p>
              <p><strong>Appointment:</strong> {selected.appointmentId?.referenceId || '-'}</p>
              <p><strong>Amount:</strong> ₹{selected.amount} {selected.currency}</p>
              <p><strong>Status:</strong> <span className="capitalize">{selected.status}</span></p>
              <p><strong>Transaction:</strong> {selected.transactionId || 'Not assigned'}</p>
            </div>
            <textarea className="input-field mt-4 min-h-[80px]" placeholder="Verification note" value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => updatePayment(selected, 'completed')} className="btn-action bg-green-50 text-green-600 hover:bg-green-100">Approve</button>
              <button onClick={() => updatePayment(selected, 'completed')} className="btn-action bg-blue-50 text-blue-600 hover:bg-blue-100">Mark Successful</button>
              <button onClick={() => updatePayment(selected, 'failed')} className="btn-action bg-red-50 text-red-600 hover:bg-red-100">Mark Failed</button>
              <button onClick={() => updatePayment(selected, 'cancelled')} className="btn-action bg-red-50 text-red-600 hover:bg-red-100">Cancel</button>
              <button onClick={() => updatePayment(selected, 'refunded')} className="btn-action bg-gray-100 text-gray-600 hover:bg-gray-200">Refunded</button>
            </div>
            <button onClick={() => setSelected(null)} className="btn-outline mt-6 w-full">Close</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
