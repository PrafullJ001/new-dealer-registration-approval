import { useEffect, useState } from 'react';
import api, { errorText } from '../api';

const TYPES = [
  { key: 'STATE', label: 'States' },
  { key: 'DEALER_TYPE', label: 'Dealer types' },
];

export default function Masters() {
  const [type, setType] = useState('STATE');
  const [items, setItems] = useState([]);
  const [version, setVersion] = useState(0);
  const [value, setValue] = useState('');
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api.get('/masters', { params: { type } }).then((r) => setItems(r.data)).catch((e) => setMsg({ bad: true, text: errorText(e) }));
  }, [type, version]);

  const reload = () => setVersion((v) => v + 1);

  async function add(e) {
    e.preventDefault();
    setMsg(null);
    try {
      await api.post('/masters', { type, value });
      setValue('');
      reload();
    } catch (err) {
      setMsg({ bad: true, text: errorText(err) });
    }
  }

  async function toggle(item) {
    setMsg(null);
    try {
      await api.patch(`/masters/${item._id}`, { isActive: !item.isActive });
      reload();
    } catch (err) {
      setMsg({ bad: true, text: errorText(err) });
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">Masters</h1>
      <p className="mb-5 text-muted">
        These values fill the dropdowns in the dealer form. A disabled value disappears from the form, and existing dealers keep it.
      </p>

      <div className="card">
        <div className="mb-4 flex">
          {TYPES.map((t) => (
            <button key={t.key} onClick={() => { setType(t.key); setMsg(null); }}
              className={`-ml-px border px-4 py-1.5 first:ml-0 ${
                type === t.key ? 'border-accent bg-accent text-white' : 'border-line bg-white hover:border-accent'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {msg && <div className="error-box">{msg.text}</div>}

        <form onSubmit={add} className="mb-4 flex max-w-md gap-3">
          <input className="input" placeholder="New value" aria-label="New value"
            value={value} onChange={(e) => setValue(e.target.value)} />
          <button className="btn btn-primary">Add</button>
        </form>

        <table className="data-table">
          <thead><tr><th>Value</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {items.map((m) => (
              <tr key={m._id}>
                <td>{m.value}</td>
                <td>{m.isActive ? 'Active' : 'Disabled'}</td>
                <td className="text-right">
                  <button className="btn btn-sm" onClick={() => toggle(m)}>{m.isActive ? 'Disable' : 'Enable'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}