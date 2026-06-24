import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Shield } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/axios';
import features from '../../config/features';
import toast, { Toaster } from 'react-hot-toast';

/**
 * Payment Page — PLACEHOLDER
 * When PAYMENT_ENABLED=false, shows info message and redirects.
 * When enabled, uncomment Razorpay/Stripe integration blocks below.
 */
export default function PaymentPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.post('/payments/create-order', { appointmentId })
      .then((res) => {
        setPayment(res.data);
        setLoading(false);
        if (!res.data.paymentEnabled) {
          toast('Payment gateway is not configured. Appointment booked with payment pending.');
        }
      })
      .catch(() => setLoading(false));
  }, [appointmentId]);

  const handlePay = async () => {
    if (!features.paymentEnabled) {
      toast.error('Payment is not enabled. Contact admin for manual payment.');
      return;
    }

    // --- RAZORPAY CHECKOUT (uncomment when ready) ---
    // const options = {
    //   key: payment.keyId,
    //   amount: payment.payment.amount * 100,
    //   currency: payment.payment.currency,
    //   order_id: payment.orderId,
    //   handler: async (response) => {
    //     await api.post('/payments/verify', {
    //       paymentId: payment.payment._id,
    //       providerPaymentId: response.razorpay_payment_id,
    //       providerSignature: response.razorpay_signature,
    //     });
    //     toast.success('Payment successful!');
    //     navigate(`/patient/booking-success/${appointmentId}`);
    //   },
    // };
    // const rzp = new window.Razorpay(options);
    // rzp.open();

    // --- STRIPE CHECKOUT (alternative, uncomment when ready) ---
    // const stripe = await loadStripe(payment.publishableKey);
    // await stripe.confirmCardPayment(payment.clientSecret);

    toast.error('Configure payment gateway keys to enable online payments.');
  };

  if (loading) {
    return (
      <DashboardLayout title="Payment">
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Payment" subtitle="Complete your consultation fee payment.">
      <Toaster position="top-right" />
      <div className="mx-auto max-w-md">
        <div className="card text-center">
          <CreditCard className="mx-auto h-12 w-12 text-primary-500" />
          <h2 className="mt-4 text-xl font-bold">Consultation Payment</h2>
          <p className="mt-2 text-3xl font-bold text-green-600">₹{payment?.payment?.amount || 0}</p>

          {!features.paymentEnabled && (
            <div className="mt-4 rounded-xl bg-yellow-50 p-4 text-sm text-yellow-700">
              Payment gateway is not configured. Your appointment is confirmed with payment pending.
            </div>
          )}

          <button onClick={handlePay} className="btn-primary mt-6 w-full">
            {features.paymentEnabled ? 'Pay Now' : 'Payment Unavailable'}
          </button>
          <button onClick={() => navigate(`/patient/booking-success/${appointmentId}`)} className="btn-outline mt-3 w-full">
            Skip — Pay Later
          </button>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
            <Shield className="h-4 w-4" /> Secure payment powered by Razorpay / Stripe (when configured)
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
