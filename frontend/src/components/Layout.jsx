import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="shell">
      <header className="topbar">
        <strong>Secure Notes</strong>
        <nav>
          <NavLink to="/notes">Notes</NavLink>
          <NavLink to="/posts">Posts</NavLink>
          {isAdmin && <NavLink to="/users">Users</NavLink>}
          {isAdmin && <NavLink to="/admin/notes">All notes</NavLink>}
          {isAdmin && <NavLink to="/admin/analytics/users-by-interest">Users by interest</NavLink>}
        </nav>
        <div className="session">
          <span>
            {user?.name} ({user?.role})
          </span>
          <button type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
