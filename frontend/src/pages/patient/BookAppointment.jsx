import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Star, ChevronLeft, ChevronRight, Calendar, Clock, Info } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { formatDate, getDoctorImage, getDoctorName, TIME_SLOTS } from '../../utils/helpers';
import features from '../../config/features';

const STEPS = ['Select Doctor', 'Select Date & Time', 'Appointment Details', 'Confirmation'];

export default function BookAppointment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const doctorIdFromUrl = searchParams.get('doctorId');
  const [step, setStep] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [search, setSearch] = useState('');
  const [spec, setSpec] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ date: '', time: '', symptoms: '', reason: '' });
  const [loading, setLoading] = useState(false);

  const fetchDoctors = () => {
    api.get('/doctors', { params: { search, specialization: spec, page, limit: 4 } }).then((res) => {
      setDoctors(res.data.doctors);
      setTotal(res.data.total);
    });
  };

  useEffect(() => {
    api.get('/doctors/specializations').then((res) => setSpecializations(res.data));
    fetchDoctors();
  }, [search, spec, page]);

  useEffect(() => {
    if (!doctorIdFromUrl) return;
    api.get(`/doctors/${doctorIdFromUrl}`).then((res) => {
      setSelected(res.data);
      setStep(1);
    }).catch(() => {});
  }, [doctorIdFromUrl]);

  const handleBook = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/appointments', {
        doctorId: selected._id,
        date: form.date,
        time: form.time,
        symptoms: form.symptoms,
        reason: form.reason,
      });

      // Redirect to payment if enabled, otherwise to confirmation page
      if (features.paymentEnabled) {
        navigate(`/patient/payment/${data._id}`);
      } else {
        navigate(`/patient/booking-success/${data._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Book Appointment" subtitle="Schedule an appointment with your preferred doctor.">
      <Toaster position="top-right" />

      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${i <= step ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {i + 1}
            </div>
            <span className={`hidden text-sm sm:block ${i <= step ? 'font-semibold text-primary-500' : 'text-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="mx-2 hidden h-0.5 w-8 bg-gray-200 sm:block" />}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {step === 0 && (
            <div className="card">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input className="input-field pl-11" placeholder="Search doctor by name or specialization..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <select className="input-field sm:w-48" value={spec} onChange={(e) => { setSpec(e.target.value); setPage(1); }}>
                  <option value="all">All Specializations</option>
                  {specializations.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="mt-6 space-y-4">
                {selected && doctorIdFromUrl && !doctors.some((doc) => doc._id === selected._id) && (
                  <label className="flex cursor-pointer flex-col gap-4 rounded-2xl border-2 border-primary-500 bg-primary-50/30 p-4 transition sm:flex-row sm:items-center">
                    <input type="radio" name="doctor" className="sr-only" checked readOnly />
                    <img src={getDoctorImage(selected)} alt="" className="h-20 w-20 rounded-2xl object-cover" />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{getDoctorName(selected)}</h4>
                      <p className="text-sm text-primary-500">{selected.specialization}</p>
                      <div className="mt-1 flex items-center gap-1 text-sm text-yellow-500">
                        <Star className="h-4 w-4 fill-current" /> {selected.rating?.toFixed(1)} ({selected.reviewCount} reviews)
                      </div>
                      <p className="text-sm text-gray-500">{selected.experience}+ Years Experience</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Consultation Fee</p>
                      <p className="text-xl font-bold text-green-600">₹{selected.consultationFee}</p>
                    </div>
                  </label>
                )}
                {doctors.map((doc) => (
                  <label key={doc._id} className={`flex cursor-pointer flex-col gap-4 rounded-2xl border-2 p-4 transition sm:flex-row sm:items-center ${selected?._id === doc._id ? 'border-primary-500 bg-primary-50/30' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input type="radio" name="doctor" className="sr-only" checked={selected?._id === doc._id} onChange={() => setSelected(doc)} />
                    <img src={getDoctorImage(doc)} alt="" className="h-20 w-20 rounded-2xl object-cover" />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{getDoctorName(doc)}</h4>
                      <p className="text-sm text-primary-500">{doc.specialization}</p>
                      <div className="mt-1 flex items-center gap-1 text-sm text-yellow-500">
                        <Star className="h-4 w-4 fill-current" /> {doc.rating?.toFixed(1)} ({doc.reviewCount} reviews)
                      </div>
                      <p className="text-sm text-gray-500">{doc.experience}+ Years Experience</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Consultation Fee</p>
                      <p className="text-xl font-bold text-green-600">₹{doc.consultationFee}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                <span>Showing {(page - 1) * 4 + 1} to {Math.min(page * 4, total)} of {total} doctors</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="rounded-lg border p-2 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
                  <button onClick={() => setPage(page + 1)} disabled={page * 4 >= total} className="rounded-lg border p-2 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="card space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold">Select Date</label>
                <input type="date" className="input-field" min={new Date().toISOString().split('T')[0]} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">Select Time</label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {TIME_SLOTS.map((t) => (
                    <button key={t} type="button" onClick={() => setForm({ ...form, time: t })} className={`rounded-lg border py-2 text-sm ${form.time === t ? 'border-primary-500 bg-primary-50 text-primary-500' : 'border-gray-200 hover:border-gray-300'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="card space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold">Symptoms</label>
                <textarea className="input-field min-h-[100px]" placeholder="Describe your symptoms..." value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">Reason for Visit</label>
                <textarea className="input-field min-h-[80px]" placeholder="Reason for visit..." value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
              </div>
            </div>
          )}
        </div>

        <div className="card h-fit">
          <h3 className="font-bold text-gray-900">Booking Summary</h3>
          {selected ? (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <img src={getDoctorImage(selected)} alt="" className="h-14 w-14 rounded-xl object-cover" />
                <div>
                  <p className="font-semibold">{getDoctorName(selected)}</p>
                  <p className="text-sm text-primary-500">{selected.specialization}</p>
                </div>
              </div>
              {form.date && (
                <p className="flex items-center gap-2 text-sm text-gray-600"><Calendar className="h-4 w-4" /> {formatDate(form.date)}</p>
              )}
              {form.time && (
                <p className="flex items-center gap-2 text-sm text-gray-600"><Clock className="h-4 w-4" /> {form.time}</p>
              )}
              <p className="text-lg font-bold text-green-600">₹{selected.consultationFee}</p>
              <div className="flex gap-2 rounded-xl bg-primary-50 p-3 text-xs text-primary-600">
                <Info className="h-4 w-4 shrink-0" />
                Appointment fee is non-refundable. Please arrive 10 minutes early.
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">Select a doctor to see summary</p>
          )}

          {step < 3 && (
            <button
              disabled={!selected || (step === 1 && (!form.date || !form.time)) || loading}
              onClick={() => step === 2 ? handleBook() : setStep(step + 1)}
              className="btn-primary mt-6 w-full disabled:opacity-50"
            >
              {step === 2 ? (loading ? 'Booking...' : 'Confirm Appointment') : `Next: ${STEPS[step + 1]}`}
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
