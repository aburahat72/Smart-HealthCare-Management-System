import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Stethoscope, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';
import OtpInput from '../../components/OtpInput';
import features from '../../config/features';
import toast, { Toaster } from 'react-hot-toast';

const roles = [
  { id: 'patient', label: 'Patient', icon: User },
  { id: 'doctor', label: 'Doctor', icon: Stethoscope },
  { id: 'admin', label: 'Admin', icon: Shield },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('patient');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(localStorage.getItem('remember') === 'true');
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [form, setForm] = useState({
    email: localStorage.getItem('rememberEmail') || '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      localStorage.setItem('remember', remember);
      const payload = { ...form, role };
      if (otpStep && otp) payload.otp = otp;

      const data = await login(payload.email, payload.password, payload.role, payload.otp);

      if (data.requiresOtp) {
        setOtpStep(true);
        toast.success('OTP sent. Please verify to continue.');
        return;
      }

      toast.success('Login successful!');
      const path = data.role === 'admin' ? '/admin/dashboard' : data.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
      navigate(path);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="hidden flex-col justify-between bg-primary-50 p-12 lg:flex">
          <Logo />
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Welcome Back!</h1>
            <p className="mt-2 text-lg text-primary-500">Login to your account</p>
            <p className="mt-4 text-gray-500">Access your dashboard to manage appointments, patients, and healthcare services efficiently.</p>
            <img src="https://illustrations.popsy.co/amber/doctor.svg" alt="" className="mt-8 max-w-md" />
          </div>
        </div>

        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden"><Logo /></div>
            <div className="card">
              <h2 className="text-center text-2xl font-bold text-gray-900">Login</h2>
              <p className="mt-1 text-center text-sm text-gray-500">Please login to continue</p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {!otpStep && (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Select Role</label>
                      <div className="grid grid-cols-3 gap-3">
                        {roles.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setRole(r.id)}
                            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${role === r.id ? 'border-primary-500 bg-primary-50 text-primary-500' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                          >
                            <r.icon className="h-6 w-6" />
                            <span className="text-xs font-semibold">{r.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input className="input-field pl-11" type="email" placeholder="Enter your email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input className="input-field pl-11 pr-11" type={showPass ? 'text' : 'password'} placeholder="Enter your password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-gray-300 text-primary-500" />
                        Remember me
                      </label>
                      <Link to="/forgot-password" className="text-sm font-medium text-primary-500">Forgot password?</Link>
                    </div>
                  </>
                )}

                {otpStep && features.otpEnabled && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Enter OTP</label>
                    <OtpInput value={otp} onChange={setOtp} />
                    <button type="button" onClick={() => setOtpStep(false)} className="mt-2 text-xs text-primary-500">Back to login</button>
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
                  {loading ? 'Logging in...' : otpStep ? 'Verify & Login' : 'Login'}
                </button>

                {!otpStep && (
                  <>
                    <div className="relative text-center">
                      <span className="bg-white px-4 text-sm text-gray-400">OR</span>
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                    </div>

                    <button type="button" className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-3 text-sm font-medium hover:bg-gray-50">
                      <img src="https://www.google.com/favicon.ico" alt="" className="h-5 w-5" /> Login with Google
                    </button>
                  </>
                )}
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                Don&apos;t have an account? <Link to="/register" className="font-semibold text-primary-500">Sign Up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
