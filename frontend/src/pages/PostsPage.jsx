import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export function PostsPage() {
  const { user } = useAuth();
  const [userId, setUserId] = useState(user?.id || '');
  const [submittedId, setSubmittedId] = useState(user?.id || '');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!submittedId) return undefined;
    let cancelled = false;
    setLoading(true);
    api(`/api/users/${submittedId}/posts`)
      .then((body) => {
        if (cancelled) return;
        setResult(body);
        setError('');
      })
      .catch((err) => {
        if (!cancelled) {
          setResult(null);
          setError(err.message || 'Could not load posts');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [submittedId]);

  function onSubmit(event) {
    event.preventDefault();
    setSubmittedId(userId.trim());
  }

  const posts = result?.posts || [];

  return (
    <section>
      <h1>User posts</h1>
      <form className="card stack" onSubmit={onSubmit}>
        <label>
          User id
          <input value={userId} onChange={(event) => setUserId(event.target.value)} required />
        </label>
        <button type="submit">Load posts</button>
      </form>
      {error && <p className="error">{error}</p>}
      {loading ? <p>Loading posts…</p> : null}
      {result && (
        <>
          <p>
            {result.name} ({result.email})
          </p>
          {posts.length === 0 ? <p>No posts.</p> : null}
          {posts.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Content</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post._id}>
                    <td>{post.title}</td>
                    <td>{post.content}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </section>
  );
}
