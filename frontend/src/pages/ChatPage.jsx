import { useState, useEffect } from 'react';
import api from '../api';
import Layout from '../components/Layout';

export default function ChatPage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/patients', { params: { limit: 500 } })
      .then(({ data }) => setPatients(data.patients))
      .catch(() => setError('Failed to load patients'));
  }, []);

  useEffect(() => {
    if (!selectedPatientId) {
      setMessages([]);
      return;
    }
    setLoadingHistory(true);
    api.get('/chat', { params: { patientId: selectedPatientId } })
      .then(({ data }) => setMessages(data.messages || []))
      .catch(() => setError('Failed to load chat'))
      .finally(() => setLoadingHistory(false));
  }, [selectedPatientId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg || !selectedPatientId || sending) return;
    setSending(true);
    setError('');
    try {
      const { data } = await api.post('/chat', { patientId: selectedPatientId, message: msg });
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: msg, created_at: new Date().toISOString() },
        { role: 'assistant', content: data.content, created_at: data.created_at },
      ]);
      setInput('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Chat</h2>
          <label className="block text-sm font-medium text-slate-700 mb-2">Select patient</label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="w-full max-w-xs px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50/50 focus:bg-white"
          >
            <option value="">— Choose patient —</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mx-6 rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex-1 min-h-[280px] px-6 py-4 bg-slate-50/50 border-t border-slate-100">
          {!selectedPatientId ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-slate-500">Select a patient to view and send messages.</p>
            </div>
          ) : loadingHistory ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-slate-500">Loading chat...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-slate-500">No messages yet. Send one below.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    m.role === 'user'
                      ? 'self-end bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'self-start bg-white border border-slate-200 text-slate-800 shadow-sm'
                  }`}
                >
                  <div className="text-xs font-medium opacity-80 mb-1">
                    {m.role === 'user' ? 'You' : 'Assistant'}
                  </div>
                  <div className="text-sm leading-relaxed">{m.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 bg-white">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              disabled={!selectedPatientId || sending}
              className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!selectedPatientId || !input.trim() || sending}
              className="px-5 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-500/25"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
