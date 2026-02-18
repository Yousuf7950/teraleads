import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Layout from '../components/Layout';

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', dob: '', medical_notes: '' });

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/patients', { params: { page, limit } });
      setPatients(data.patients);
      setTotal(data.total);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [page]);

  const openAdd = () => {
    setModal('add');
    setForm({ name: '', email: '', phone: '', dob: '', medical_notes: '' });
  };

  const openEdit = (p) => {
    setModal('edit');
    setForm({
      id: p.id,
      name: p.name,
      email: p.email || '',
      phone: p.phone || '',
      dob: p.dob ? p.dob.slice(0, 10) : '',
      medical_notes: p.medical_notes || '',
    });
  };

  const closeModal = () => setModal(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal === 'add') {
        await api.post('/patients', form);
      } else {
        await api.put(`/patients/${form.id}`, form);
      }
      closeModal();
      fetchPatients();
    } catch (err) {
      setError(err.response?.data?.error || 'Request failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this patient?')) return;
    try {
      await api.delete(`/patients/${id}`);
      fetchPatients();
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed');
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <Layout>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
          <h2 className="text-xl font-semibold text-slate-800">Patients</h2>
          <button
            type="button"
            onClick={openAdd}
            className="px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-colors"
          >
            Add Patient
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 rounded-xl bg-red-50 border border-red-100 px-4 py-2.5">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        {loading ? (
          <div className="py-16 text-center">
            <p className="text-slate-500">Loading...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-500 mb-4">No patients yet.</p>
            <button
              type="button"
              onClick={openAdd}
              className="text-blue-600 font-medium hover:underline"
            >
              Add your first patient
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-left">
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">DOB</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">{p.name}</td>
                      <td className="px-6 py-4 text-slate-600">{p.email || '—'}</td>
                      <td className="px-6 py-4 text-slate-600">{p.phone || '—'}</td>
                      <td className="px-6 py-4 text-slate-600">{p.dob ? p.dob.slice(0, 10) : '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className="mr-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-wrap justify-between items-center gap-4">
              <span className="text-sm text-slate-500">Total: {total}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600 px-2">Page {page} of {totalPages}</span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-30 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-5">
              {modal === 'add' ? 'Add Patient' : 'Edit Patient'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">DOB</label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Medical notes</label>
                <textarea
                  value={form.medical_notes}
                  onChange={(e) => setForm((f) => ({ ...f, medical_notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-y"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                  Save
                </button>
                <button type="button" onClick={closeModal} className="px-4 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
