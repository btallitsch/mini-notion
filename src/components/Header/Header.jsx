// src/components/Header/Header.jsx

import { useState } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useDocStore } from '../../store/documentStore';
import { logOut, getUserDisplayName, getUserInitials } from '../../firebase/auth';
import RoleToggle from '../RoleToggle/RoleToggle';

export default function Header({ user }) {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const syncStatus = useDocStore((s) => s.syncStatus);
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = getUserInitials(user);
  const displayName = getUserDisplayName(user);

  return (
    <div style={{ height: 50, background: '#11111b', borderBottom: '1px solid #313244', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0, position: 'relative', zIndex: 20 }}>
      <button onClick={toggleSidebar}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6c7086', fontSize: 20, padding: '4px 8px', borderRadius: 8 }}
        title="Toggle sidebar (Ctrl+B)">☰</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <SyncIndicator status={syncStatus} />
        <RoleToggle />

        {/* User avatar + dropdown */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setMenuOpen(!menuOpen)}
            style={{ width: 32, height: 32, borderRadius: '50%', background: user?.photoURL ? 'transparent' : 'linear-gradient(135deg,#cba6f7,#f5c2e7)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 0 }}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt={displayName} style={{ width: 32, height: 32, borderRadius: '50%' }} referrerPolicy="no-referrer" />
            ) : (
              <span style={{ fontSize: 13, fontWeight: 800, color: '#1e1e2e' }}>{initials}</span>
            )}
          </button>

          {menuOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setMenuOpen(false)} />
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 50, background: '#1e1e2e', border: '1px solid #313244', borderRadius: 12, padding: 8, minWidth: 200, boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
                <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid #313244', marginBottom: 6 }}>
                  <div style={{ color: '#cdd6f4', fontSize: 13, fontWeight: 700 }}>{displayName}</div>
                  <div style={{ color: '#6c7086', fontSize: 11, marginTop: 2 }}>{user?.email}</div>
                </div>
                <button onClick={() => { setMenuOpen(false); logOut(); }}
                  style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', borderRadius: 8, color: '#f38ba8', cursor: 'pointer', fontSize: 13, fontWeight: 600, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#313244'} onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                  ↩ Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SyncIndicator({ status }) {
  const configs = {
    loading: { dot: '#f9e2af', text: 'Syncing…', anim: true },
    synced:  { dot: '#a6e3a1', text: 'Synced',   anim: false },
    error:   { dot: '#f38ba8', text: 'Sync error', anim: false },
  };
  const cfg = configs[status];
  if (!cfg) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot, display: 'inline-block', animation: cfg.anim ? 'pulse 1.2s infinite' : 'none' }} />
      <span style={{ color: '#6c7086', fontSize: 12 }}>{cfg.text}</span>
    </div>
  );
}
