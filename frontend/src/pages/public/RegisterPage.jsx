import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';
import api from '../../api/axios';
import OtpInput from '../../components/OtpInput';
import features from '../../config/features';
import toast, { Toaster } from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [regSettings, setRegSettings] = useState({ allowPatientRegistration: true, allowDoctorRegistration: true });
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'patient',
  });

  useEffect(() => {
    api.get('/settings/public').then((res) => {
      setRegSettings(res.data);
      if (!res.data.allowPatientRegistration && res.data.allowDoctorRegistration) {
        setForm((f) => ({ ...f, role: 'doctor' }));
      }
    }).catch(() => {});
  }, []);

  const availableRoles = [
    regSettings.allowPatientRegistration && { value: 'patient', label: 'Patient' },
    regSettings.allowDoctorRegistration && { value: 'doctor', label: 'Doctor' },
  ].filter(Boolean);

  const registrationDisabled = availableRoles.length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role: form.role };
      if (otpStep && otp) payload.otp = otp;

      const data = await register(payload);

      if (data.requiresOtp) {
        setOtpStep(true);
        toast.success('OTP sent. Please verify to complete registration.');
        return;
      }

      toast.success('Account created successfully!');
      const path = data.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
      navigate(path);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
            <h1 className="text-4xl font-bold text-gray-900">Create Account</h1>
            <p className="mt-2 text-lg text-primary-500">Register to get started</p>
            <p className="mt-4 text-gray-500">Join our healthcare platform to book appointments, manage records, and get AI health assistance.</p>
            <img src="https://illustrations.popsy.co/amber/nurse.svg" alt="" className="mt-8 max-w-md" />
          </div>
        </div>

        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden"><Logo /></div>
            <div className="card">
              <h2 className="text-center text-2xl font-bold text-gray-900">Create Account</h2>
              <p className="mt-1 text-center text-sm text-gray-500">Register to get started</p>

              {registrationDisabled ? (
                <div className="mt-8 rounded-xl bg-yellow-50 p-6 text-center">
                  <p className="font-semibold text-yellow-800">Registration Closed</p>
                  <p className="mt-2 text-sm text-yellow-700">New registrations are currently disabled. Please contact the administrator.</p>
                  <Link to="/login" className="btn-primary mt-4 inline-block">Go to Login</Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input className="input-field pl-11" placeholder="Enter your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
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
                      <input className="input-field pl-11 pr-11" type={showPass ? 'text' : 'password'} placeholder="Enter password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input className="input-field pl-11" type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
                    </div>
                  </div>

                  {availableRoles.length > 1 && (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Select Role</label>
                      <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                        {availableRoles.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {availableRoles.length === 1 && (
                    <p className="text-sm text-gray-500">Registering as: <span className="font-semibold capitalize">{availableRoles[0].label}</span></p>
                  )}

                  {otpStep && features.otpEnabled && (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Enter OTP</label>
                      <OtpInput value={otp} onChange={setOtp} />
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
                    {loading ? 'Creating Account...' : otpStep ? 'Verify & Register' : 'Register'}
                  </button>
                </form>
              )}

              <p className="mt-6 text-center text-sm text-gray-500">
                Already have an account? <Link to="/login" className="font-semibold text-primary-500">Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
