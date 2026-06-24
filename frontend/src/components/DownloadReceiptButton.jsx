import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

/**
 * Download Receipt Button
 * -----------------------
 * Downloads appointment PDF receipt from GET /api/receipts/:appointmentId
 * Used on: Booking Success, My Appointments, Appointment Details
 */
export default function DownloadReceiptButton({ appointmentId, className = '' }) {
  const [loading, setLoading] = useState(false);

  const download = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/receipts/${appointmentId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${appointmentId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Receipt downloaded');
    } catch {
      toast.error('Failed to download receipt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={download}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-primary-500 px-4 py-2.5 text-sm font-semibold text-primary-500 transition hover:bg-primary-50 disabled:opacity-60 ${className}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      Download Receipt
    </button>
  );
}
