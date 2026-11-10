import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Pager } from '../components/Pager';

const emptyForm = { title: '', content: '' };

export function NotesPage() {
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [notes, setNotes] = useState([]);
  const [meta, setMeta] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api(`/api/notes?page=${page}&limit=10`)
      .then((result) => {
        if (cancelled) return;
        setNotes(result.data);
        setMeta(result.meta);
        setError('');
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load notes');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, reload]);

  function startEdit(note) {
    setEditingId(note.id);
    setForm({ title: note.title, content: note.content });
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
    const body = JSON.stringify({ title: form.title, content: form.content });
    try {
      if (editingId) {
        await api(`/api/notes/${editingId}`, { method: 'PATCH', body });
      } else {
        await api('/api/notes', { method: 'POST', body });
        setPage(1);
      }
      cancelEdit();
      setReload((value) => value + 1);
    } catch (err) {
      setError(err.message || 'Could not save note');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(note) {
    if (!window.confirm(`Delete "${note.title}"?`)) return;
    setError('');
    try {
      await api(`/api/notes/${note.id}`, { method: 'DELETE' });
      if (editingId === note.id) cancelEdit();
      if (notes.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        setReload((value) => value + 1);
      }
    } catch (err) {
      setError(err.message || 'Could not delete note');
    }
  }

  return (
    <section>
      <h1>My notes</h1>
      <form className="card stack" onSubmit={onSubmit}>
        <h2>{editingId ? 'Edit note' : 'New note'}</h2>
        <label>
          Title
          <input
            required
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
          />
        </label>
        <label>
          Content
          <textarea
            required
            value={form.content}
            onChange={(event) => setForm({ ...form, content: event.target.value })}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <div className="actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create note'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? <p>Loading notes…</p> : null}
      {!loading && notes.length === 0 ? <p>No notes yet.</p> : null}
      {notes.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Content</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {notes.map((note) => (
              <tr key={note.id}>
                <td>{note.title}</td>
                <td>{note.content}</td>
                <td>{new Date(note.updatedAt).toLocaleString()}</td>
                <td className="actions">
                  <button type="button" onClick={() => startEdit(note)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => onDelete(note)}>
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
