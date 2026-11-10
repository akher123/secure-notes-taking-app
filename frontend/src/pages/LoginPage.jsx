import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function LoginPage() {
  const { token, login, register } = useAuth();
  const navigate = useNavigate();
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [busy, setBusy] = useState('');

  if (token) {
    return <Navigate to="/notes" replace />;
  }

  async function onLogin(event) {
    event.preventDefault();
    setLoginError('');
    setBusy('login');
    try {
      await login(loginForm.email, loginForm.password);
      navigate('/notes', { replace: true });
    } catch (err) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setBusy('');
    }
  }

  async function onRegister(event) {
    event.preventDefault();
    setRegisterError('');
    setBusy('register');
    try {
      await register(registerForm);
      navigate('/notes', { replace: true });
    } catch (err) {
      setRegisterError(err.message || 'Registration failed');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="shell">
      <h1>Secure Notes</h1>
      <p className="hint">
        Demo user: rahim@example.com / test123. Demo admin: admin@example.com / admin123.
      </p>
      <div className="auth-grid">
        <form className="card stack" onSubmit={onLogin}>
          <h2>Login</h2>
          <label>
            Email
            <input
              type="email"
              required
              autoComplete="username"
              value={loginForm.email}
              onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={loginForm.password}
              onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
            />
          </label>
          {loginError && <p className="error">{loginError}</p>}
          <button type="submit" disabled={busy === 'login'}>
            {busy === 'login' ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <form className="card stack" onSubmit={onRegister}>
          <h2>Register</h2>
          <label>
            Name
            <input
              required
              value={registerForm.name}
              onChange={(event) => setRegisterForm({ ...registerForm, name: event.target.value })}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={registerForm.email}
              onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={registerForm.password}
              onChange={(event) =>
                setRegisterForm({ ...registerForm, password: event.target.value })
              }
            />
          </label>
          {registerError && <p className="error">{registerError}</p>}
          <button type="submit" disabled={busy === 'register'}>
            {busy === 'register' ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
