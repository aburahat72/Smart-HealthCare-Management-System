/**
 * AI Assistant Service
 * --------------------
 * Supports Gemini with safe healthcare guidance and local fallback responses.
 */

import { GoogleGenAI } from '@google/genai';
import features from '../config/features.js';

const HEALTHCARE_DISCLAIMER =
  'Please note: I can provide general health information and guidance, but I am not a substitute for a licensed doctor. For urgent, severe, or worsening symptoms, please seek immediate medical care.';

const ASSISTANT_IDENTITY =
  'I am the Smart Healthcare AI Assistant, a professional digital assistant for Smart Healthcare. I can help with appointment booking guidance, doctor availability, hospital services, and general health information.';

const SYSTEM_INSTRUCTION = [
  'You are the Smart Healthcare AI Assistant for the Smart Healthcare Management System.',
  'If the user asks who you are, do not say you are Gemini, Google, or any model name. Say: "I am the Smart Healthcare AI Assistant."',
  'Be professional, calm, concise, and patient-friendly.',
  'Provide general healthcare information, symptom guidance, department suggestions, and help with using the hospital system.',
  'Do not diagnose, prescribe medicine, or claim certainty about medical conditions.',
  'For emergencies, severe symptoms, chest pain, breathing difficulty, fainting, severe bleeding, stroke symptoms, or rapidly worsening symptoms, advise urgent medical care immediately.',
  `Include this disclaimer when giving health guidance: ${HEALTHCARE_DISCLAIMER}`,
].join('\n');

const FALLBACK_RESPONSES = [
  {
    keywords: ['who are you', 'what are you', 'your name', 'are you gemini', 'are you google'],
    response: ASSISTANT_IDENTITY,
  },
  {
    keywords: ['book', 'appointment', 'schedule'],
    response: 'To book an appointment: log in, go to Book Appointment, select a doctor, choose a date and time, then confirm your booking. You can also register as a new patient from the homepage.',
  },
  {
    keywords: ['register', 'sign up', 'create account'],
    response: 'To register: click Register on the homepage, enter your name, email, and password, select Patient, then submit. After registration, you can book appointments immediately.',
  },
  {
    keywords: ['contact', 'support', 'help', 'phone'],
    response: `For support, contact us at ${features.hospital.phone} or email ${features.hospital.email}. You can also use the contact form on the homepage.`,
  },
  {
    keywords: ['doctor', 'available', 'availability'],
    response: 'To check doctor availability: go to Book Appointment, browse doctors by specialization, and select a date to view available time slots.',
  },
  {
    keywords: ['service', 'hospital', 'offer', 'facility'],
    response: 'Smart Healthcare supports online appointment booking, doctor search, secure medical records, AI health guidance, and appointment tracking.',
  },
  {
    keywords: ['payment', 'fee', 'cost', 'price'],
    response: 'Consultation fees vary by doctor and are shown during booking. You can check payment and receipt details from your patient dashboard.',
  },
  {
    keywords: ['record', 'medical', 'history'],
    response: 'You can access your medical records from the patient dashboard under Medical Records. Doctors can upload records after consultations.',
  },
  {
    keywords: ['cancel', 'cancellation'],
    response: 'To cancel an appointment: go to My Appointments, find the appointment, and choose Cancel. Cancellation is available for pending and upcoming appointments.',
  },
];

const getFallbackResponse = (message) => {
  const text = message.toLowerCase();
  for (const item of FALLBACK_RESPONSES) {
    if (item.keywords.some((keyword) => text.includes(keyword))) {
      return item.response;
    }
  }

  return `${ASSISTANT_IDENTITY} Please ask a specific question, or describe your symptoms for department recommendations. ${HEALTHCARE_DISCLAIMER}`;
};

const hasHealthContent = (message) => {
  const text = message.toLowerCase();
  return [
    'pain',
    'fever',
    'cough',
    'symptom',
    'medicine',
    'tablet',
    'doctor',
    'treatment',
    'diagnose',
    'diagnosis',
    'blood',
    'breathing',
    'chest',
    'headache',
    'vomit',
    'infection',
    'rash',
    'injury',
    'emergency',
    'pregnant',
    'sick',
    'health',
  ].some((word) => text.includes(word));
};

const addHealthcareDisclaimer = (response, message) => {
  if (!hasHealthContent(message)) return response;
  if (response.toLowerCase().includes('not a substitute for a licensed doctor')) return response;
  return `${response}\n\n${HEALTHCARE_DISCLAIMER}`;
};

const normalizeHistory = (conversationHistory = []) =>
  conversationHistory
    .filter((item) => item?.content || item?.text || item?.message)
    .slice(-8)
    .map((item) => {
      const role = item.role === 'assistant' || item.role === 'model' ? 'model' : 'user';
      const text = item.content || item.text || item.message;
      return { role, parts: [{ text }] };
    });

const callAiApi = async (message, conversationHistory = []) => {
  if (!features.ai.enabled) return null;
  if (features.ai.provider !== 'gemini') return null;
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[AI] Gemini API key is missing. Falling back to local responses.');
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: features.ai.model,
      contents: [
        ...normalizeHistory(conversationHistory),
        { role: 'user', parts: [{ text: message }] },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
      },
    });

    return response.text || null;
  } catch (error) {
    console.error(`[AI] Gemini request failed: ${error.message}`);
    return null;
  }
};

export const processChatMessage = async (message, conversationHistory = []) => {
  if (/who are you|what are you|your name|are you gemini|are you google/i.test(message)) {
    return { response: ASSISTANT_IDENTITY, source: 'identity' };
  }

  const aiResponse = await callAiApi(message, conversationHistory);
  if (aiResponse) {
    return { response: addHealthcareDisclaimer(aiResponse, message), source: 'ai' };
  }

  return { response: addHealthcareDisclaimer(getFallbackResponse(message), message), source: 'fallback' };
};

export const analyzeSymptoms = (symptoms) => {
  const symptomMap = {
    fever: 'General Medicine',
    headache: 'General Medicine',
    cough: 'General Medicine',
    'chest pain': 'Cardiology',
    'skin rash': 'Dermatology',
    'joint pain': 'Orthopedics',
    dizziness: 'Neurology',
    anxiety: 'Psychiatry',
    'stomach pain': 'Gastroenterology',
  };

  const text = symptoms.toLowerCase();
  const matched = new Set();
  for (const [symptom, department] of Object.entries(symptomMap)) {
    if (text.includes(symptom)) matched.add(department);
  }

  const primary = matched.size > 0 ? [...matched][0] : 'General Medicine';
  return {
    primaryDepartment: primary,
    message: `Based on your symptoms, you should consult the ${primary} department. ${HEALTHCARE_DISCLAIMER}`,
  };
};

export default { processChatMessage, analyzeSymptoms, getFallbackResponse };
