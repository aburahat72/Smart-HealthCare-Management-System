import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/axios';
import { getPatientImage, getPatientName } from '../../utils/helpers';

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/patients', { params: { search } }).then((res) => setPatients(res.data.patients));
  }, [search]);

  return (
    <DashboardLayout title="Patients" subtitle="View your patient list and medical history.">
      <div className="card">
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input className="input-field pl-11" placeholder="Search patients..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((p) => (
            <div key={p._id} className="rounded-xl border border-gray-100 p-4 transition hover:shadow-md">
              <div className="flex items-center gap-3">
                <img src={getPatientImage(p)} alt="" className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <p className="font-semibold">{getPatientName(p)}</p>
                  <p className="text-sm text-gray-500">{p.email}</p>
                </div>
              </div>
              <Link to={`/doctor/patients/${p._id}`} className="btn-outline mt-4 w-full py-2 text-xs">View Profile</Link>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
