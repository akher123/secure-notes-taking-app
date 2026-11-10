import { useEffect, useState } from 'react';
import { api } from '../api/client';

export function AnalyticsPage() {
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api('/api/admin/analytics/users-by-interest')
      .then((result) => {
        if (!cancelled) {
          setGroups(Array.isArray(result) ? result : []);
          setError('');
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load interests');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section>
      <h1>Users by interest</h1>
      {error && <p className="error">{error}</p>}
      {loading ? <p>Loading…</p> : null}
      {!loading && groups.length === 0 ? <p>No interests.</p> : null}
      {groups.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Interest</th>
              <th>Count</th>
              <th>Users</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group._id}>
                <td>{group._id}</td>
                <td>{group.count}</td>
                <td>
                  <ul className="plain-list">
                    {(group.users || []).map((user) => (
                      <li key={user.id}>
                        {user.name} ({user.email})
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
