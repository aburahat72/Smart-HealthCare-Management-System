import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import Logo from '../../components/Logo';
import OtpInput from '../../components/OtpInput';
import api from '../../api/axios';
import features from '../../config/features';
import toast, { Toaster } from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'done'
  const [loading, setLoading] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      if (data.requiresOtp) {
        setStep('otp');
        toast.success('OTP sent to your registered contact');
      } else {
        setStep('done');
        if (data.devResetUrl) setDevResetUrl(data.devResetUrl);
        toast.success(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword: 'temp' });
      // OTP verified — redirect to reset page with email
      window.location.href = `/reset-password?email=${encodeURIComponent(email)}&otp=${otp}`;
    } catch {
      // If OTP-only flow, go to reset page
      window.location.href = `/reset-password?email=${encodeURIComponent(email)}&otp=${otp}`;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center"><Logo /></div>
          <div className="card">
            <Link to="/login" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500">
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
            <h2 className="text-2xl font-bold text-gray-900">Forgot Password</h2>
            <p className="mt-1 text-sm text-gray-500">Enter your email to receive a reset link or OTP</p>

            {step === 'email' && (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    className="input-field pl-11"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}

            {step === 'otp' && features.otpEnabled && (
              <form onSubmit={handleOtpReset} className="mt-6 space-y-4">
                <p className="text-sm text-gray-500">Enter the OTP sent to your registered contact</p>
                <OtpInput value={otp} onChange={setOtp} />
                <button type="submit" disabled={loading || otp.length < 6} className="btn-primary w-full disabled:opacity-60">
                  Verify OTP
                </button>
              </form>
            )}

            {step === 'done' && (
              <div className="mt-6 rounded-xl bg-green-50 p-4 text-center">
                <p className="text-sm text-green-700">Check your email for the reset link.</p>
                {devResetUrl && (
                  <div className="mt-3 rounded-lg bg-yellow-50 p-3 text-left">
                    <p className="text-xs font-semibold text-yellow-800">Dev Mode (email disabled):</p>
                    <Link to={devResetUrl.replace(window.location.origin, '')} className="mt-1 break-all text-xs text-primary-500 underline">
                      Click here to reset password
                    </Link>
                  </div>
                )}
                <Link to="/login" className="btn-primary mt-4 inline-block">Back to Login</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
