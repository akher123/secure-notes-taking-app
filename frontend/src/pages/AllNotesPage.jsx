import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Pager } from '../components/Pager';

export function AllNotesPage() {
  const [page, setPage] = useState(1);
  const [notes, setNotes] = useState([]);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api(`/api/admin/notes?page=${page}&limit=10`)
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
  }, [page]);

  return (
    <section>
      <h1>All notes</h1>
      <p className="hint">Read-only list of every note.</p>
      {error && <p className="error">{error}</p>}
      {loading ? <p>Loading notes…</p> : null}
      {!loading && notes.length === 0 ? <p>No notes.</p> : null}
      {notes.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Content</th>
              <th>User id</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {notes.map((note) => (
              <tr key={note.id}>
                <td>{note.title}</td>
                <td>{note.content}</td>
                <td>{note.userId}</td>
                <td>{new Date(note.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Pager meta={meta} onPage={setPage} />
    </section>
  );
}
