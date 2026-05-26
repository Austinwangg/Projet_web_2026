import { useState } from 'react';
import Logo from './Logo.jsx';
import { login, register } from '../services/authService.js';

export default function AuthModal({ mode, T, onClose, onAuth }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  if (!mode) return null;
  const isSignup = mode === 'signup';

  const handleSubmit = async () => {
    setError('');
    if (!email || !password || (isSignup && !name)) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      const res = isSignup
        ? await register(name, email, password)
        : await login(email, password);
      onAuth(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit(); };

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 24 }}>
          <Logo small />
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <h2 className="serif" style={{ fontSize: 32, marginBottom: 28, letterSpacing: '-0.02em' }}>
          {isSignup ? T.auth.signupTitle : T.auth.signinTitle}
        </h2>

        <div className="col gap-16">
          {isSignup && (
            <div>
              <label className="field-label">{T.auth.name}</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={handleKey} placeholder="Jean Dupont" />
            </div>
          )}
          <div>
            <label className="field-label">{T.auth.email}</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKey} placeholder="jean@exemple.com" />
          </div>
          <div>
            <label className="field-label">{T.auth.password}</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKey} placeholder="••••••••" />
          </div>

          {error && (
            <p style={{ color: 'var(--danger)', fontSize: 13, margin: 0 }}>{error}</p>
          )}

          {!isSignup && <a className="muted" style={{ fontSize: 13, cursor: 'pointer' }}>{T.auth.forgot}</a>}

          <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>
            {loading ? '…' : (isSignup ? T.auth.signup : T.auth.signin)}
          </button>

          <div className="center muted" style={{ fontSize: 13 }}>
            {isSignup ? T.auth.hasAccount : T.auth.noAccount}
          </div>
        </div>
      </div>
    </div>
  );
}
