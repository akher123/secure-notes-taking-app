import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Pager } from '../components/Pager';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'user',
  interests: '',
};

function parseInterests(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function UsersPage() {
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api(`/api/users?page=${page}&limit=10`)
      .then((result) => {
        if (cancelled) return;
        setUsers(result.data);
        setMeta(result.meta);
        setError('');
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load users');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, reload]);

  function startEdit(user) {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      interests: (user.interests || []).join(', '),
    });
    setError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const interests = parseInterests(form.interests);
    try {
      if (editingId) {
        const payload = {
          name: form.name,
          email: form.email,
          role: form.role,
          interests,
        };
        if (form.password) payload.password = form.password;
        await api(`/api/users/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await api('/api/users', {
          method: 'POST',
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
            interests,
          }),
        });
        setPage(1);
      }
      cancelEdit();
      setReload((value) => value + 1);
    } catch (err) {
      setError(err.message || 'Could not save user');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(user) {
    if (!window.confirm(`Delete ${user.email}?`)) return;
    setError('');
    try {
      await api(`/api/users/${user.id}`, { method: 'DELETE' });
      if (editingId === user.id) cancelEdit();
      if (users.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        setReload((value) => value + 1);
      }
    } catch (err) {
      setError(err.message || 'Could not delete user');
    }
  }

  return (
    <section>
      <h1>Users</h1>
      <form className="card stack" onSubmit={onSubmit}>
        <h2>{editingId ? 'Edit user' : 'New user'}</h2>
        <label>
          Name
          <input
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
        </label>
        <label>
          Password {editingId ? '(leave blank to keep current)' : ''}
          <input
            type="password"
            required={!editingId}
            minLength={form.password ? 6 : undefined}
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </label>
        <label>
          Role
          <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </label>
        <label>
          Interests (comma separated)
          <input
            value={form.interests}
            onChange={(event) => setForm({ ...form, interests: event.target.value })}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <div className="actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create user'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? <p>Loading users…</p> : null}
      {!loading && users.length === 0 ? <p>No users.</p> : null}
      {users.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Interests</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{(user.interests || []).join(', ')}</td>
                <td className="actions">
                  <button type="button" onClick={() => startEdit(user)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => onDelete(user)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Pager meta={meta} onPage={setPage} />
    </section>
  );
}
