/**
 * AI Assistant Service
 * --------------------
 * Architecture supports OpenAI and Gemini APIs with predefined fallback responses.
 * AI is DISABLED by default — set AI_ENABLED=true and add API keys to activate.
 *
 * To enable OpenAI: OPENAI_API_KEY, AI_PROVIDER=openai
 * To enable Gemini:  GEMINI_API_KEY, AI_PROVIDER=gemini
 */

import features from '../config/features.js';

/** Predefined fallback responses when AI API is unavailable */
const FALLBACK_RESPONSES = [
  {
    keywords: ['book', 'appointment', 'schedule'],
    response: 'To book an appointment: Login → Go to "Book Appointment" → Select a doctor → Choose date & time → Confirm. You can also register as a new patient from the homepage.',
  },
  {
    keywords: ['register', 'sign up', 'create account'],
    response: 'To register: Click "Register" on the homepage → Fill in your name, email, and password → Select Patient role → Submit. You can then book appointments immediately.',
  },
  {
    keywords: ['contact', 'support', 'help', 'phone'],
    response: `For support, contact us at ${features.hospital.phone} or email ${features.hospital.email}. You can also use the Contact form on our homepage.`,
  },
  {
    keywords: ['doctor', 'available', 'availability'],
    response: 'To check doctor availability: Go to "Book Appointment" → Browse doctors by specialization → Select a date to see available time slots. Featured doctors are listed on our homepage.',
  },
  {
    keywords: ['service', 'hospital', 'offer', 'facility'],
    response: 'Our services include: Online appointment booking, doctor search, secure medical records, AI health assistant, and real-time appointment tracking. Visit the Services section on our homepage for details.',
  },
  {
    keywords: ['payment', 'fee', 'cost', 'price'],
    response: 'Consultation fees vary by doctor and are shown during booking. Payment can be made online when the payment module is enabled. Check your appointment receipt for fee details.',
  },
  {
    keywords: ['record', 'medical', 'history'],
    response: 'Access your medical records from the patient dashboard under "Medical Records". Your doctor can upload records after consultations.',
  },
  {
    keywords: ['cancel', 'cancellation'],
    response: 'To cancel an appointment: Go to "My Appointments" → Find the appointment → Click "Cancel". Cancellations are allowed for pending and upcoming appointments.',
  },
];

/** Match user message against fallback keyword patterns */
const getFallbackResponse = (message) => {
  const text = message.toLowerCase();
  for (const item of FALLBACK_RESPONSES) {
    if (item.keywords.some((kw) => text.includes(kw))) {
      return item.response;
    }
  }
  return 'I can help with booking appointments, registration, doctor availability, hospital services, and support contact. Please ask a specific question, or describe your symptoms for department recommendations.';
};

/**
 * Call external AI API — COMMENTED until keys are configured.
 * Uncomment the relevant provider block when AI_ENABLED=true.
 */
const callAiApi = async (message, conversationHistory = []) => {
  if (!features.ai.enabled) return null;

  // --- OPENAI API (uncomment when ready) ---
  // const response = await fetch('https://api.openai.com/v1/chat/completions', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     model: features.ai.model,
  //     messages: [
  //       { role: 'system', content: 'You are a helpful healthcare assistant for Smart Healthcare clinic. Provide concise, professional health guidance. Always recommend consulting a doctor for serious symptoms.' },
  //       ...conversationHistory,
  //       { role: 'user', content: message },
  //     ],
  //   }),
  // });
  // const data = await response.json();
  // return data.choices[0].message.content;

  // --- GEMINI API (alternative, uncomment when ready) ---
  // const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] }),
  // });
  // const data = await response.json();
  // return data.candidates[0].content.parts[0].text;

  return null;
};

/** Main chat handler — tries AI API, falls back to predefined responses */
export const processChatMessage = async (message, conversationHistory = []) => {
  const aiResponse = await callAiApi(message, conversationHistory);
  if (aiResponse) {
    return { response: aiResponse, source: 'ai' };
  }
  return { response: getFallbackResponse(message), source: 'fallback' };
};

/** Symptom analysis fallback (existing keyword-based logic preserved) */
export const analyzeSymptoms = (symptoms) => {
  const symptomMap = {
    fever: 'General Medicine', headache: 'General Medicine', cough: 'General Medicine',
    'chest pain': 'Cardiology', 'skin rash': 'Dermatology', 'joint pain': 'Orthopedics',
    dizziness: 'Neurology', anxiety: 'Psychiatry', 'stomach pain': 'Gastroenterology',
  };
  const text = symptoms.toLowerCase();
  const matched = new Set();
  for (const [symptom, dept] of Object.entries(symptomMap)) {
    if (text.includes(symptom)) matched.add(dept);
  }
  const primary = matched.size > 0 ? [...matched][0] : 'General Medicine';
  return {
    primaryDepartment: primary,
    message: `Based on your symptoms, you should consult the ${primary} department.`,
  };
};

export default { processChatMessage, analyzeSymptoms, getFallbackResponse };
