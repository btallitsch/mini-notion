import { useDocStore } from '../../store/documentStore';
import { useUIStore } from '../../store/uiStore';
import DocumentItem from './DocumentItem';

export default function Sidebar() {
  const rootIds = useDocStore((s) => s.rootDocumentIds);
  const role = useUIStore((s) => s.role);
  const { addDocument } = useDocStore.getState();
  const { selectDocument } = useUIStore.getState();

  return (
    <div style={{ width: 256, background: '#181825', borderRight: '1px solid #313244',
      display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid #313244' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 4px' }}>
          <span style={{ fontSize: 22 }}>🗒️</span>
          <span style={{ color: '#cdd6f4', fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em' }}>Mini Notion</span>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        <div style={{ padding: '6px 16px 4px', fontSize: 10, color: '#6c7086', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Workspace
        </div>
        {rootIds.map((id) => <DocumentItem key={id} docId={id} depth={0} />)}
      </div>
      {role === 'editor' && (
        <div style={{ padding: 10, borderTop: '1px solid #313244' }}>
          <button
            onClick={() => { const id = addDocument(null); selectDocument(id); }}
            style={{ width: '100%', padding: '8px 12px', background: '#313244', border: 'none', borderRadius: 9,
              color: '#cdd6f4', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#45475a'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#313244'}>
            <span style={{ fontSize: 16 }}>+</span> New Page
          </button>
        </div>
      )}
    </div>
  );
}
