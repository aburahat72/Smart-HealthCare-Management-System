import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import { loadFeatures } from './config/features';
import api from './api/axios';

import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import ResetPasswordPage from './pages/public/ResetPasswordPage';
import VerifyEmailPage from './pages/public/VerifyEmailPage';

import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointment from './pages/patient/BookAppointment';
import BookingSuccessPage from './pages/patient/BookingSuccessPage';
import MyAppointments from './pages/patient/MyAppointments';
import MedicalRecords from './pages/patient/MedicalRecords';
import AIAssistant from './pages/patient/AIAssistant';
import PaymentPage from './pages/patient/PaymentPage';
import PaymentHistoryPage from './pages/patient/PaymentHistoryPage';

import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPatients from './pages/doctor/DoctorPatients';
import PatientDetail from './pages/doctor/PatientDetail';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManagePatients from './pages/admin/ManagePatients';
import ManageAppointments from './pages/admin/ManageAppointments';
import ManagePayments from './pages/admin/ManagePayments';
import ManageHero from './pages/admin/ManageHero';
import Reports from './pages/admin/Reports';

import ProfilePage from './pages/shared/ProfilePage';
import SettingsPage from './pages/shared/SettingsPage';

export default function App() {
  useEffect(() => { loadFeatures(api); }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          <Route path="/patient/dashboard" element={<ProtectedRoute roles={['patient']}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/book-appointment" element={<ProtectedRoute roles={['patient']}><BookAppointment /></ProtectedRoute>} />
          <Route path="/patient/booking-success/:id" element={<ProtectedRoute roles={['patient']}><BookingSuccessPage /></ProtectedRoute>} />
          <Route path="/patient/payment/:appointmentId" element={<ProtectedRoute roles={['patient']}><PaymentPage /></ProtectedRoute>} />
          <Route path="/patient/payments" element={<ProtectedRoute roles={['patient']}><PaymentHistoryPage /></ProtectedRoute>} />
          <Route path="/patient/appointments" element={<ProtectedRoute roles={['patient']}><MyAppointments /></ProtectedRoute>} />
          <Route path="/patient/medical-records" element={<ProtectedRoute roles={['patient']}><MedicalRecords /></ProtectedRoute>} />
          <Route path="/patient/ai-assistant" element={<ProtectedRoute roles={['patient']}><AIAssistant /></ProtectedRoute>} />
          <Route path="/patient/profile" element={<ProtectedRoute roles={['patient']}><ProfilePage /></ProtectedRoute>} />
          <Route path="/patient/settings" element={<ProtectedRoute roles={['patient']}><SettingsPage /></ProtectedRoute>} />

          <Route path="/doctor/dashboard" element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/appointments" element={<ProtectedRoute roles={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
          <Route path="/doctor/patients" element={<ProtectedRoute roles={['doctor']}><DoctorPatients /></ProtectedRoute>} />
          <Route path="/doctor/patients/:id" element={<ProtectedRoute roles={['doctor']}><PatientDetail /></ProtectedRoute>} />
          <Route path="/doctor/profile" element={<ProtectedRoute roles={['doctor']}><ProfilePage role="doctor" /></ProtectedRoute>} />
          <Route path="/doctor/settings" element={<ProtectedRoute roles={['doctor']}><SettingsPage role="doctor" /></ProtectedRoute>} />

          <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute roles={['admin']}><ManageDoctors /></ProtectedRoute>} />
          <Route path="/admin/patients" element={<ProtectedRoute roles={['admin']}><ManagePatients /></ProtectedRoute>} />
          <Route path="/admin/appointments" element={<ProtectedRoute roles={['admin']}><ManageAppointments /></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute roles={['admin']}><ManagePayments /></ProtectedRoute>} />
          <Route path="/admin/hero" element={<ProtectedRoute roles={['admin']}><ManageHero /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><Reports /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute roles={['admin']}><ProfilePage role="admin" /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute roles={['admin']}><SettingsPage role="admin" /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
