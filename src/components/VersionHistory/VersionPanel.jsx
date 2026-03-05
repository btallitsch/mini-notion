// src/components/VersionHistory/VersionPanel.jsx

import { useDocStore } from '../../store/documentStore';
import { useUIStore } from '../../store/uiStore';
import { formatDate, formatFull } from '../../utils/dateUtils';

export default function VersionPanel({ docId, uid }) {
  const versions = useDocStore((s) => s.versions[docId] || []);
  const { restoreVersion } = useDocStore.getState();
  const { toggleVersionHistory } = useUIStore.getState();

  return (
    <div style={{ width: 272, background: '#181825', borderLeft: '1px solid #313244', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #313244', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#cdd6f4', fontWeight: 700, fontSize: 13 }}>⏰ Version History</span>
        <button onClick={toggleVersionHistory} style={{ background: 'none', border: 'none', color: '#6c7086', cursor: 'pointer', fontSize: 20 }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
        {versions.length === 0 ? (
          <div style={{ color: '#6c7086', fontSize: 12, textAlign: 'center', marginTop: 36, lineHeight: 1.8 }}>
            No saved versions yet.<br />Edit and pause to autosave.
          </div>
        ) : versions.map((v, i) => (
          <div key={v.id} style={{ marginBottom: 8, padding: 12, background: '#1e1e2e', borderRadius: 10, border: '1px solid #313244' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: i === 0 ? '#a6e3a1' : '#cba6f7', fontSize: 11, fontWeight: 700 }}>
                {i === 0 ? '● Current' : `v${versions.length - i}`}
              </span>
              <span style={{ color: '#6c7086', fontSize: 11 }} title={formatFull(v.savedAt)}>
                {formatDate(v.savedAt)}
              </span>
            </div>
            <div style={{ color: '#cdd6f4', fontSize: 13, fontWeight: 600, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {v.emoji} {v.title}
            </div>
            <div style={{ color: '#6c7086', fontSize: 11, marginBottom: i > 0 ? 8 : 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {v.content?.replace(/[#*_`>-]/g, '').slice(0, 100)}…
            </div>
            {i > 0 && (
              <button
                onClick={() => { if (window.confirm('Restore this version? Current content will be overwritten.')) restoreVersion(uid, docId, v.id); }}
                style={{ width: '100%', padding: '5px', background: '#313244', border: 'none', borderRadius: 7, color: '#cba6f7', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#45475a'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#313244'}>
                ↩ Restore this version
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
