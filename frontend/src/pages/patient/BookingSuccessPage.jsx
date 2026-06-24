import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, User, Hash, CreditCard } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import DownloadReceiptButton from '../../components/DownloadReceiptButton';
import api from '../../api/axios';
import { formatDate, formatDateTime, getDoctorName } from '../../utils/helpers';
import features from '../../config/features';

/** Booking confirmation page shown after successful appointment booking */
export default function BookingSuccessPage() {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/appointments/${id}`).then((res) => {
      setAppointment(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="Booking Confirmation">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!appointment) {
    return (
      <DashboardLayout title="Booking Confirmation">
        <div className="card text-center">
          <p className="text-gray-500">Appointment not found.</p>
          <Link to="/patient/appointments" className="btn-primary mt-4 inline-block">View Appointments</Link>
        </div>
      </DashboardLayout>
    );
  }

  const paymentLabel = appointment.paymentStatus === 'completed' ? 'Paid' : appointment.paymentStatus === 'not_required' ? 'Not Required' : 'Pending';

  return (
    <DashboardLayout title="Booking Confirmation" subtitle="Your appointment has been successfully booked.">
      <div className="mx-auto max-w-2xl">
        <div className="card text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Thank You!</h2>
          <p className="mt-2 text-gray-500">Your appointment has been booked successfully.</p>

          <div className="mt-8 rounded-2xl bg-gray-50 p-6 text-left">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary-500">
              <Hash className="h-4 w-4" /> Reference ID: {appointment.referenceId}
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-400" />
                <span><strong>Doctor:</strong> {getDoctorName(appointment.doctorId)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span><strong>Date:</strong> {formatDate(appointment.date)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-400" />
                <span><strong>Time:</strong> {appointment.time}</span>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <span><strong>Fee:</strong> ₹{appointment.consultationFee}</span>
              </div>
              <div className="flex items-center gap-3">
                <span><strong>Status:</strong> <StatusBadge status={appointment.status} /></span>
              </div>
              <div className="flex items-center gap-3">
                <span><strong>Payment:</strong> <span className={paymentLabel === 'Paid' ? 'text-green-600' : 'text-yellow-600'}>{paymentLabel}</span></span>
              </div>
            </div>
          </div>

          {/* Status tracking timeline */}
          {appointment.statusHistory?.length > 0 && (
            <div className="mt-6 text-left">
              <h3 className="text-sm font-semibold text-gray-700">Booking Status Tracking</h3>
              <div className="mt-3 space-y-2">
                {appointment.statusHistory.map((h, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="h-2 w-2 rounded-full bg-primary-500" />
                    <span className="capitalize">{h.status}</span>
                    <span>—</span>
                    <span>{new Date(h.changedAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <DownloadReceiptButton appointmentId={appointment._id} />
            {features.paymentEnabled && appointment.paymentStatus === 'pending' && (
              <Link to={`/patient/payment/${appointment._id}`} className="btn-primary">Pay Now</Link>
            )}
            <Link to="/patient/appointments" className="btn-outline">View My Appointments</Link>
          </div>

          {/* Future notification placeholders */}
          <p className="mt-6 text-xs text-gray-400">
            Confirmation notification sent. SMS &amp; email alerts will be delivered when those services are configured.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
