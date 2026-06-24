import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/axios';
import { getPatientImage, getPatientName } from '../../utils/helpers';

export default function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    api.get(`/patients/${id}`).then((res) => setPatient(res.data));
    api.get('/medical-records', { params: { patientId: id } }).then((res) => setRecords(res.data));
  }, [id]);

  if (!patient) return null;

  return (
    <DashboardLayout title="Patient Profile" subtitle="View patient details and medical history.">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card text-center">
          <img src={getPatientImage(patient)} alt="" className="mx-auto h-24 w-24 rounded-full object-cover" />
          <h2 className="mt-4 text-xl font-bold">{getPatientName(patient)}</h2>
          <p className="text-sm text-gray-500">{patient.email}</p>
          {patient.phone && <p className="mt-2 text-sm text-gray-500">{patient.phone}</p>}
          {patient.address && <p className="mt-1 text-sm text-gray-500">{patient.address}</p>}
        </div>

        <div className="card lg:col-span-2">
          <h3 className="font-bold text-gray-900">Medical History</h3>
          <div className="mt-4 space-y-3">
            {records.map((r) => (
              <div key={r._id} className="rounded-xl border border-gray-100 p-4">
                <h4 className="font-semibold">{r.title}</h4>
                <p className="mt-1 text-sm text-gray-500">{r.description}</p>
                <p className="mt-2 text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
            {records.length === 0 && <p className="text-center text-gray-400 py-8">No medical records</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
