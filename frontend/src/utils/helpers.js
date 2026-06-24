export const getDoctorName = (doctor) => doctor?.userId?.name || doctor?.name || 'Unknown Doctor';
export const getMediaUrl = (url) => {
  if (!url) return '';
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/api\/?$/, '');
  return `${apiBase}${url.startsWith('/') ? url : `/${url}`}`;
};
export const getDoctorImage = (doctor) =>
  getMediaUrl(doctor?.image || doctor?.userId?.profileImage) || `https://ui-avatars.com/api/?name=${encodeURIComponent(getDoctorName(doctor))}&background=0056D2&color=fff`;
export const getPatientName = (patient) => patient?.name || 'Unknown Patient';
export const getPatientImage = (patient) =>
  getMediaUrl(patient?.profileImage) || `https://ui-avatars.com/api/?name=${encodeURIComponent(getPatientName(patient))}&background=0056D2&color=fff`;

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (date, time) => {
  return `${formatDate(date)}${time ? `, ${time}` : ''}`;
};

export const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM',
];
