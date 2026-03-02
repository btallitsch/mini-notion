import { useUIStore } from '../../store/uiStore';
import RoleToggle from '../RoleToggle/RoleToggle';

export default function Header() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <div style={{ height: 50, background: '#11111b', borderBottom: '1px solid #313244',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px', flexShrink: 0 }}>
      <button onClick={toggleSidebar}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6c7086', fontSize: 20, padding: '4px 8px', borderRadius: 8 }}
        title="Toggle sidebar (Ctrl+B)">☰</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <RoleToggle />
        <div style={{ width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg,#cba6f7,#f5c2e7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 800, color: '#1e1e2e' }}>U</div>
      </div>
    </div>
  );
}
