// src/components/Editor/EditorToolbar.jsx

import { useUIStore } from '../../store/uiStore';

const TOOLS = [
  { label: 'H1', action: '# ' },
  { label: 'H2', action: '## ' },
  { label: 'H3', action: '### ' },
  { label: 'Bold', action: '**', wrap: true },
  { label: 'Italic', action: '_', wrap: true },
  { label: 'Code', action: '`', wrap: true },
  { label: '— Rule', action: '\n---\n' },
  { label: '• List', action: '- ' },
  { label: '☑ Todo', action: '- [ ] ' },
  { label: '> Quote', action: '> ' },
];

export default function EditorToolbar({ onFormat }) {
  const role = useUIStore((s) => s.role);
  if (role !== 'editor') return null;

  return (
    <div style={{ display: 'flex', gap: 4, padding: '7px 24px', borderBottom: '1px solid #313244', flexWrap: 'wrap', background: '#181825', flexShrink: 0 }}>
      {TOOLS.map((t) => (
        <button key={t.label} onClick={() => onFormat(t)}
          style={{ padding: '4px 10px', background: '#313244', border: 'none', borderRadius: 6, color: '#cdd6f4', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#45475a'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#313244'}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
