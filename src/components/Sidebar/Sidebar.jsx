// src/components/Sidebar/Sidebar.jsx

import { useDocStore } from '../../store/documentStore';
import { useUIStore } from '../../store/uiStore';
import DocumentItem from './DocumentItem';

export default function Sidebar({ uid }) {
  const rootIds = useDocStore((s) => s.rootDocumentIds);
  const syncStatus = useDocStore((s) => s.syncStatus);
  const role = useUIStore((s) => s.role);

  return (
    <div style={{ width: 256, background: '#181825', borderRight: '1px solid #313244', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid #313244' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 4px' }}>
          <span style={{ fontSize: 22 }}>🗒️</span>
          <span style={{ color: '#cdd6f4', fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em' }}>Mini Notion</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {syncStatus === 'loading' ? (
          <div style={{ padding: '32px 16px', textAlign: 'center' }}>
            <div style={{ color: '#6c7086', fontSize: 12 }}>Loading workspace…</div>
          </div>
        ) : (
          <>
            <div style={{ padding: '6px 16px 4px', fontSize: 10, color: '#6c7086', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Workspace
            </div>
            {rootIds.length === 0 && (
              <div style={{ padding: '20px 16px', color: '#6c7086', fontSize: 12, textAlign: 'center' }}>
                No pages yet.<br />Create one below.
              </div>
            )}
            {rootIds.map((id) => <DocumentItem key={id} docId={id} depth={0} uid={uid} />)}
          </>
        )}
      </div>

      {role === 'editor' && syncStatus !== 'loading' && (
        <div style={{ padding: 10, borderTop: '1px solid #313244' }}>
          <button
            onClick={async () => {
              const id = await useDocStore.getState().addDocument(uid, null);
              useUIStore.getState().selectDocument(id);
            }}
            style={{ width: '100%', padding: '8px 12px', background: '#313244', border: 'none', borderRadius: 9, color: '#cdd6f4', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#45475a'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#313244'}>
            <span style={{ fontSize: 16 }}>+</span> New Page
          </button>
        </div>
      )}
    </div>
  );
}
