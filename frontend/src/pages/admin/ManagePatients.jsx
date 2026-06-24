import { useEffect, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { getPatientImage, getPatientName } from '../../utils/helpers';

export default function ManagePatients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');

  const fetch = () => api.get('/patients', { params: { search } }).then((res) => setPatients(res.data.patients));

  useEffect(() => { fetch(); }, [search]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this patient?')) return;
    try {
      await api.delete(`/patients/${id}`);
      toast.success('Patient deleted');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <DashboardLayout title="Manage Patients" subtitle="View and manage all patients.">
      <Toaster position="top-right" />
      <div className="card">
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input className="input-field pl-11" placeholder="Search patients..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="pb-3 pr-4">Patient</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Phone</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p._id} className="border-b border-gray-50">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <img src={getPatientImage(p)} alt="" className="h-10 w-10 rounded-full object-cover" />
                      <span className="font-medium">{getPatientName(p)}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-gray-500">{p.email}</td>
                  <td className="py-4 pr-4 text-gray-500">{p.phone || 'N/A'}</td>
                  <td className="py-4">
                    <button onClick={() => handleDelete(p._id)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
