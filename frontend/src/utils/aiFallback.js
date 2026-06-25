const fallbackAnswers = [
  {
    keywords: ['book', 'appointment', 'schedule'],
    answer: 'To book an appointment, open Book Appointment, select a doctor, choose a date and time, add your symptoms or reason, then confirm.',
  },
  {
    keywords: ['register', 'sign up', 'create account'],
    answer: 'To register, choose Register from the homepage, enter your details, select Patient, and submit the form.',
  },
  {
    keywords: ['contact', 'support', 'help', 'phone', 'email'],
    answer: 'For support, use the contact form on the homepage or ask the hospital support desk for help with appointments, payments, and records.',
  },
  {
    keywords: ['doctor', 'available', 'availability', 'find'],
    answer: 'You can check doctor availability from Book Appointment. Search by doctor name or specialization, then choose an available date and time.',
  },
  {
    keywords: ['payment', 'fee', 'cost', 'receipt'],
    answer: 'Consultation fees are shown while booking. You can view payment history and receipts from your patient dashboard.',
  },
  {
    keywords: ['record', 'medical', 'history'],
    answer: 'Your medical records are available from the Medical Records page after doctors upload consultation details.',
  },
  {
    keywords: ['cancel', 'reschedule'],
    answer: 'To manage an appointment, open My Appointments and choose the available action for that appointment.',
  },
];

const healthKeywords = ['pain', 'fever', 'headache', 'cough', 'symptom', 'feel', 'hurt', 'ache', 'sick', 'chest', 'breathing'];

export const isSymptomMessage = (message) => {
  const text = message.toLowerCase();
  return healthKeywords.some((keyword) => text.includes(keyword));
};

export const getLocalAiFallback = (message) => {
  const text = message.toLowerCase();
  const matched = fallbackAnswers.find((item) => item.keywords.some((keyword) => text.includes(keyword)));
  if (matched) return matched.answer;

  if (isSymptomMessage(message)) {
    return 'I can give general guidance, but I cannot diagnose. For symptoms, please book an appointment with a suitable doctor or visit urgent care for severe or worsening symptoms.';
  }

  return 'I can help with appointment booking, registration, doctor availability, payments, medical records, and hospital support. Please ask one of these common questions.';
};
