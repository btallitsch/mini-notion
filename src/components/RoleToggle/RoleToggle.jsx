// src/components/RoleToggle/RoleToggle.jsx

import { useUIStore } from '../../store/uiStore';

export default function RoleToggle() {
  const role = useUIStore((s) => s.role);
  const setRole = useUIStore((s) => s.setRole);

  return (
    <div style={{ display: 'flex', background: '#313244', borderRadius: 10, padding: 3 }}>
      {[['editor', '✏️ Editor'], ['readonly', '👁️ View']].map(([r, label]) => (
        <button key={r} onClick={() => setRole(r)}
          style={{ padding: '5px 13px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: role === r ? '#cba6f7' : 'transparent', color: role === r ? '#1e1e2e' : '#a6adc8', transition: 'all 0.15s' }}>
          {label}
        </button>
      ))}
    </div>
  );
}
