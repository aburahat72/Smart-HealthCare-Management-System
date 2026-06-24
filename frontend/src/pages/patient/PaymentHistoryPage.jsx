import { useEffect, useState } from 'react';
import { CreditCard, Receipt } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/axios';
import { formatDateTime } from '../../utils/helpers';

/** Patient payment transaction history */
export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    api.get('/payments/history').then((res) => setPayments(res.data.payments));
  }, []);

  const statusColor = (s) => {
    if (s === 'completed') return 'text-green-600 bg-green-50';
    if (s === 'failed') return 'text-red-600 bg-red-50';
    if (s === 'refunded') return 'text-blue-600 bg-blue-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  return (
    <DashboardLayout title="Payment History" subtitle="View your transaction history and payment status.">
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="pb-3 pr-4">Transaction</th>
                <th className="pb-3 pr-4">Appointment</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-b border-gray-50">
                  <td className="py-4 pr-4 font-mono text-xs">{p.transactionId || p._id.slice(-8)}</td>
                  <td className="py-4 pr-4">{p.appointmentId?.referenceId || '—'}</td>
                  <td className="py-4 pr-4 font-semibold">₹{p.amount}</td>
                  <td className="py-4 pr-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${statusColor(p.status)}`}>{p.status}</span>
                  </td>
                  <td className="py-4 text-gray-500">{formatDateTime(p.createdAt)}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <Receipt className="mx-auto h-10 w-10 text-gray-300" />
                    <p className="mt-2">No transactions yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
