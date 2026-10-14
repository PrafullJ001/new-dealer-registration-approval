import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errorText } from '../api';

const empty = { name: '', gstin: '', type: '', contactPerson: '', mobile: '', email: '', state: '', city: '' };

function Field({ label, wide, children }) {
  return (
    <div className={`mb-4 ${wide ? 'md:col-span-2' : ''}`}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

export default function DealerForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [types, setTypes] = useState([]);
  const [states, setStates] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const active = (r) => r.data.filter((m) => m.isActive);
    api.get('/masters', { params: { type: 'DEALER_TYPE' } }).then((r) => setTypes(active(r))).catch((e) => setError(errorText(e)));
    api.get('/masters', { params: { type: 'STATE' } }).then((r) => setStates(active(r))).catch((e) => setError(errorText(e)));
  }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/dealers', form);
      navigate(`/dealers/${data._id}`);
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">Register a dealer</h1>
      <p className="mb-5 text-lg text-muted">The registration goes to the approvers as Pending.</p>

      <form onSubmit={submit} className="card p-6">
        {error && <div className="error-box" role="alert">{error}</div>}

        <div className="grid gap-x-6 md:grid-cols-2">
          <Field label="Dealer name" wide>
            <input className="input" placeholder="Name as printed on the GST certificate"
              value={form.name} onChange={set('name')} />
          </Field>
          <Field label="GSTIN">
            <input className="input" placeholder="29AAGCM4412P1Z3" maxLength={15}
              value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })} />
          </Field>
          <Field label="Dealer type">
            <select className="input" value={form.type} onChange={set('type')}>
              <option value="">Select type</option>
              {types.map((m) => <option key={m._id}>{m.value}</option>)}
            </select>
          </Field>
          <Field label="Contact person">
            <input className="input" value={form.contactPerson} onChange={set('contactPerson')} />
          </Field>
          <Field label="Mobile number">
            <input className="input" placeholder="10-digit number" inputMode="numeric" maxLength={10}
              value={form.mobile} onChange={set('mobile')} />
          </Field>
          <Field label="Email address">
            <input className="input" type="email" value={form.email} onChange={set('email')} />
          </Field>
          <Field label="State">
            <select className="input" value={form.state} onChange={set('state')}>
              <option value="">Select state</option>
              {states.map((m) => <option key={m._id}>{m.value}</option>)}
            </select>
          </Field>
          <Field label="City or town">
            <input className="input" value={form.city} onChange={set('city')} />
          </Field>
        </div>

        <div className="flex gap-3">
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Submitting...' : 'Submit for approval'}
          </button>
          <button type="button" className="btn" onClick={() => navigate('/dealers')}>Cancel</button>
        </div>
      </form>
    </>
  );
}