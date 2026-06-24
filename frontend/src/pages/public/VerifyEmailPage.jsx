import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Logo from '../../components/Logo';
import api from '../../api/axios';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }
    api.get(`/auth/verify-email/${token}`)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed');
      });
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="card max-w-md w-full text-center">
        <Logo />
        <div className="mt-6">
          {status === 'loading' && (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-500" />
              <p className="mt-4 text-gray-500">Verifying your email...</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h2 className="mt-4 text-xl font-bold text-gray-900">Email Verified</h2>
              <p className="mt-2 text-sm text-gray-500">{message}</p>
              <Link to="/login" className="btn-primary mt-6 inline-block">Go to Login</Link>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <h2 className="mt-4 text-xl font-bold text-gray-900">Verification Failed</h2>
              <p className="mt-2 text-sm text-gray-500">{message}</p>
              <Link to="/login" className="btn-primary mt-6 inline-block">Go to Login</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
