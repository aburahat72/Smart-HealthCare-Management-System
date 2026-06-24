import { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/axios';

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    api.get('/medical-records').then((res) => setRecords(res.data));
  }, []);

  return (
    <DashboardLayout title="Medical Records" subtitle="View and download your medical reports.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {records.map((r) => (
          <div key={r._id} className="card">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-500">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-bold text-gray-900">{r.title}</h3>
            <p className="mt-2 text-sm text-gray-500 line-clamp-2">{r.description || 'No description'}</p>
            <p className="mt-2 text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
            {r.fileUrl && (
              <a href={r.fileUrl} download className="btn-outline mt-4 w-full py-2 text-xs">
                <Download className="h-4 w-4" /> Download Report
              </a>
            )}
          </div>
        ))}
        {records.length === 0 && (
          <div className="card col-span-full py-12 text-center text-gray-400">
            <FileText className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4">No medical records found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
