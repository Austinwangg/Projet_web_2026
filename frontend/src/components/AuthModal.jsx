import { useState } from 'react';
import Logo from './Logo.jsx';

export default function AuthModal({ mode, T, onClose, onAuth }) {
  const [email, setEmail] = useState('jean.dupont@mail.com');
  const [password, setPassword] = useState('••••••••');
  const [name, setName] = useState('Jean Dupont');
  if (!mode) return null;
  const isSignup = mode === 'signup';
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
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div>
            <label className="field-label">{T.auth.email}</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="field-label">{T.auth.password}</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {!isSignup && <a className="muted" style={{ fontSize: 13, cursor: 'pointer' }}>{T.auth.forgot}</a>}
          <button className="btn btn-primary btn-lg" onClick={() => onAuth(name)}>
            {isSignup ? T.auth.signup : T.auth.signin}
          </button>
          <div className="center muted" style={{ fontSize: 13 }}>
            {isSignup ? T.auth.hasAccount : T.auth.noAccount}
          </div>
        </div>
      </div>
    </div>
  );
}
