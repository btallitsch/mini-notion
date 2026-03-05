// src/components/Auth/AuthScreen.jsx
//
// Authentication screen shown when no user is signed in.
// Supports Google OAuth and email/password (sign in + sign up).

import { useState } from 'react';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
} from '../../firebase/auth';

const S = {
  wrap: { minHeight: '100vh', background: '#11111b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',system-ui,sans-serif" },
  card: { background: '#1e1e2e', border: '1px solid #313244', borderRadius: 20, padding: '44px 40px', width: '100%', maxWidth: 400, boxShadow: '0 32px 80px rgba(0,0,0,0.5)' },
  logo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, justifyContent: 'center' },
  h1: { color: '#cdd6f4', fontSize: 22, fontWeight: 800, margin: 0 },
  sub: { color: '#6c7086', fontSize: 13, textAlign: 'center', marginBottom: 28 },
  label: { display: 'block', color: '#a6adc8', fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: '0.04em' },
  input: { width: '100%', padding: '10px 14px', background: '#181825', border: '1px solid #313244', borderRadius: 9, color: '#cdd6f4', fontSize: 14, outline: 'none', marginBottom: 14, boxSizing: 'border-box', transition: 'border-color 0.15s' },
  btnPrimary: { width: '100%', padding: '11px', background: '#cba6f7', border: 'none', borderRadius: 10, color: '#1e1e2e', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 12, transition: 'opacity 0.15s' },
  btnGoogle: { width: '100%', padding: '11px', background: '#313244', border: '1px solid #45475a', borderRadius: 10, color: '#cdd6f4', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'background 0.15s' },
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', color: '#585b70', fontSize: 12 },
  line: { flex: 1, height: 1, background: '#313244' },
  toggle: { textAlign: 'center', color: '#6c7086', fontSize: 13 },
  link: { color: '#cba6f7', cursor: 'pointer', fontWeight: 600, background: 'none', border: 'none', padding: 0, fontSize: 13 },
  error: { background: '#3b1f1f', border: '1px solid #f38ba8', borderRadius: 8, color: '#f38ba8', fontSize: 13, padding: '10px 14px', marginBottom: 16 },
  success: { background: '#1f3b2a', border: '1px solid #a6e3a1', borderRadius: 8, color: '#a6e3a1', fontSize: 13, padding: '10px 14px', marginBottom: 16 },
};

export default function AuthScreen() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const clearMessages = () => { setError(''); setMessage(''); };

  const handleGoogle = async () => {
    clearMessages(); setLoading(true);
    try { await signInWithGoogle(); }
    catch (e) { setError(friendlyError(e.code)); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    clearMessages(); setLoading(true);
    try {
      if (mode === 'signin') await signInWithEmail(email, password);
      else if (mode === 'signup') await signUpWithEmail(email, password, displayName);
      else if (mode === 'reset') { await resetPassword(email); setMessage('Reset email sent! Check your inbox.'); }
    } catch (e) {
      setError(friendlyError(e.code));
    } finally { setLoading(false); }
  };

  const title = mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Reset password';

  return (
    <div style={S.wrap}>
      <div style={S.card}>
        <div style={S.logo}>
          <span style={{ fontSize: 32 }}>🗒️</span>
          <span style={S.h1}>Mini Notion</span>
        </div>
        <p style={S.sub}>Your cloud-synced workspace</p>

        {error && <div style={S.error}>{error}</div>}
        {message && <div style={S.success}>{message}</div>}

        {mode !== 'reset' && (
          <>
            <button style={S.btnGoogle} onClick={handleGoogle} disabled={loading}
              onMouseEnter={(e) => e.currentTarget.style.background = '#45475a'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#313244'}>
              <GoogleIcon /> Continue with Google
            </button>
            <div style={S.divider}><div style={S.line} />or<div style={S.line} /></div>
          </>
        )}

        {mode === 'signup' && (
          <>
            <label style={S.label}>Display Name</label>
            <input style={S.input} value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name" onFocus={(e) => e.target.style.borderColor='#cba6f7'} onBlur={(e) => e.target.style.borderColor='#313244'} />
          </>
        )}

        <label style={S.label}>Email</label>
        <input style={S.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com" onFocus={(e) => e.target.style.borderColor='#cba6f7'} onBlur={(e) => e.target.style.borderColor='#313244'} />

        {mode !== 'reset' && (
          <>
            <label style={S.label}>Password</label>
            <input style={S.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" onFocus={(e) => e.target.style.borderColor='#cba6f7'} onBlur={(e) => e.target.style.borderColor='#313244'}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
          </>
        )}

        <button style={{ ...S.btnPrimary, opacity: loading ? 0.6 : 1 }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Please wait…' : title}
        </button>

        {mode === 'signin' && (
          <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 16 }}>
            <button style={S.link} onClick={() => { setMode('reset'); clearMessages(); }}>Forgot password?</button>
          </div>
        )}

        <div style={S.toggle}>
          {mode === 'signin' && <>No account? <button style={S.link} onClick={() => { setMode('signup'); clearMessages(); }}>Sign up</button></>}
          {mode === 'signup' && <>Already have an account? <button style={S.link} onClick={() => { setMode('signin'); clearMessages(); }}>Sign in</button></>}
          {mode === 'reset' && <><button style={S.link} onClick={() => { setMode('signin'); clearMessages(); }}>← Back to sign in</button></>}
        </div>
      </div>
    </div>
  );
}

const friendlyError = (code) => {
  const map = {
    'auth/user-not-found': 'No account found with that email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'That email is already registered.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
  };
  return map[code] || 'Something went wrong. Please try again.';
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);
