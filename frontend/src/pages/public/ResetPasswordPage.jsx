import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Logo from '../../components/Logo';
import OtpInput from '../../components/OtpInput';
import api from '../../api/axios';
import features from '../../config/features';
import toast, { Toaster } from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');
  const otpParam = searchParams.get('otp');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [otp, setOtp] = useState(otpParam || '');
  const [email] = useState(emailParam || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const payload = { newPassword: password };
      if (token) payload.token = token;
      if (features.otpEnabled && otp && email) {
        payload.otp = otp;
        payload.email = email;
      }

      await api.post('/auth/reset-password', payload);
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (!token && !otpParam && !emailParam) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="card max-w-md text-center">
          <p className="text-gray-500">Invalid or missing reset link.</p>
          <Link to="/forgot-password" className="btn-primary mt-4 inline-block">Request New Link</Link>
        </div>
      </div>
    );
  }

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
            <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
            <p className="mt-1 text-sm text-gray-500">Enter your new password</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {features.otpEnabled && email && !token && (
                <div>
                  <label className="mb-2 block text-sm font-semibold">OTP Verification</label>
                  <OtpInput value={otp} onChange={setOtp} />
                </div>
              )}

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  className="input-field pl-11 pr-11"
                  type={showPass ? 'text' : 'password'}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  className="input-field pl-11"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
