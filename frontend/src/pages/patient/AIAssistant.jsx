import { useState } from 'react';
import { Send, Bot } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../api/axios';
import { getDoctorImage, getDoctorName } from '../../utils/helpers';

/**
 * AI Health Assistant
 * Uses /api/ai/chat with predefined fallback responses.
 * Set AI_ENABLED=true on backend to connect OpenAI/Gemini APIs.
 */
export default function AIAssistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const text = input;
    const history = messages.map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      // Try general chat first (fallback responses + future AI)
      const { data } = await api.post('/ai/chat', { message: text, history });

      // Also try symptom analysis if message looks symptom-related
      const symptomKeywords = ['pain', 'fever', 'headache', 'cough', 'symptom', 'feel', 'hurt', 'ache', 'sick'];
      const isSymptom = symptomKeywords.some((kw) => text.toLowerCase().includes(kw));

      if (isSymptom) {
        const symptomRes = await api.post('/ai/symptoms', { symptoms: text });
        setDoctors(symptomRes.data.recommendedDoctors || []);
        setMessages((prev) => [...prev, {
          role: 'ai',
          text: symptomRes.data.message,
          departments: symptomRes.data.otherDepartments,
          source: 'symptom-analysis',
        }]);
      } else {
        setDoctors([]);
        setMessages((prev) => [...prev, {
          role: 'ai',
          text: data.response,
          source: data.source,
        }]);
      }
    } catch {
      setMessages((prev) => [...prev, {
        role: 'ai',
        text: 'I can help with booking appointments, registration, doctor availability, and hospital services. Please ask a specific question.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'How to book an appointment?',
    'How to register?',
    'How to contact support?',
    'Doctor availability information',
    'Hospital service information',
  ];

  return (
    <DashboardLayout title="AI Health Assistant" subtitle="Get AI-powered health guidance and platform help.">
      <div className="mx-auto max-w-3xl">
        <div className="card flex min-h-[500px] flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto p-2">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
                <Bot className="h-16 w-16 text-primary-200" />
                <p className="mt-4">Ask me anything about our healthcare platform</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setInput(s); }}
                      className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-500 transition hover:border-primary-300 hover:text-primary-500"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 text-sm ${m.role === 'user' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  {m.role === 'ai' && <Bot className="mb-2 h-5 w-5 text-primary-500" />}
                  <p>{m.text}</p>
                  {m.departments && (
                    <div className="mt-2 border-t border-gray-200 pt-2">
                      <p className="font-semibold">Other possible departments:</p>
                      <ul className="mt-1 list-disc pl-4">
                        {m.departments.map((d) => <li key={d}>{d}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-gray-100 p-4 text-sm text-gray-500">Thinking...</div>
              </div>
            )}
          </div>

          {doctors.length > 0 && (
            <div className="border-t border-gray-100 p-4">
              <p className="mb-3 text-sm font-semibold text-gray-700">Recommended Doctors</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {doctors.map((d) => (
                  <div key={d._id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                    <img src={getDoctorImage(d)} alt="" className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-semibold">{getDoctorName(d)}</p>
                      <p className="text-xs text-primary-500">{d.specialization}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 border-t border-gray-100 p-4">
            <input
              className="input-field flex-1"
              placeholder="Ask a question or describe symptoms..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
            />
            <button onClick={send} disabled={loading} className="btn-primary px-5">
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
