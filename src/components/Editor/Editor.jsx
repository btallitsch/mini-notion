// src/components/Editor/Editor.jsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDocStore } from '../../store/documentStore';
import { useUIStore } from '../../store/uiStore';
import { useAutosave } from '../../hooks/useAutosave';
import { formatDate } from '../../utils/dateUtils';
import EditorToolbar from './EditorToolbar';
import MarkdownView from './MarkdownView';
import VersionPanel from '../VersionHistory/VersionPanel';
import EmojiPicker from '../EmojiPicker/EmojiPicker';

export default function Editor({ uid }) {
  const selectedId = useUIStore((s) => s.selectedDocId);
  const versionOpen = useUIStore((s) => s.versionHistoryOpen);
  const role = useUIStore((s) => s.role);
  const doc = useDocStore((s) => s.documents[selectedId]);
  const savingStatus = useDocStore((s) => s.savingStatus[selectedId]);
  const syncStatus = useDocStore((s) => s.syncStatus);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);

  const taRef = useRef(null);
  const triggerSave = useAutosave(uid, selectedId, title, content);

  // Sync local state when selected document changes
  useEffect(() => {
    if (doc) {
      setTitle(doc.title ?? '');
      setContent(doc.content ?? '');
      setPreview(false);
    }
  }, [selectedId]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    triggerSave();
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    triggerSave();
  };

  const handleFormat = (tool) => {
    const ta = taRef.current; if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd, sel = content.slice(s, e);
    const lineStart = content.lastIndexOf('\n', s - 1) + 1;
    const next = tool.wrap
      ? content.slice(0, s) + tool.action + sel + tool.action + content.slice(e)
      : content.slice(0, lineStart) + tool.action + content.slice(lineStart);
    setContent(next);
    triggerSave();
    setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = s + tool.action.length; }, 0);
  };

  // Loading state
  if (syncStatus === 'loading') {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e1e2e' }}>
        <div style={{ textAlign: 'center', color: '#6c7086' }}>
          <div style={{ fontSize: 42, marginBottom: 16 }}>☁️</div>
          <div style={{ fontSize: 15, color: '#a6adc8', fontWeight: 600, marginBottom: 6 }}>Loading workspace…</div>
          <div style={{ fontSize: 12 }}>Syncing from Firestore</div>
        </div>
      </div>
    );
  }

  if (!doc) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e1e2e' }}>
      <div style={{ textAlign: 'center', color: '#6c7086' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📄</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#a6adc8', marginBottom: 8 }}>No page selected</div>
        <div style={{ fontSize: 13 }}>Pick a page or create one with + New Page</div>
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Document header bar */}
        <div style={{ padding: '10px 24px', borderBottom: '1px solid #313244', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#181825', gap: 12, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
            <div style={{ position: 'relative' }}>
              <button onClick={() => role === 'editor' && setEmojiOpen(!emojiOpen)}
                style={{ fontSize: 24, background: 'none', border: 'none', cursor: role === 'editor' ? 'pointer' : 'default', borderRadius: 8, padding: 2 }}>
                {doc.emoji || '📄'}
              </button>
              {emojiOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setEmojiOpen(false)} />
                  <EmojiPicker onSelect={(e) => { useDocStore.getState().setEmoji(uid, selectedId, e); setEmojiOpen(false); }} />
                </>
              )}
            </div>
            {role === 'editor' ? (
              <input value={title} onChange={handleTitleChange}
                style={{ background: 'none', border: 'none', outline: 'none', color: '#cdd6f4', fontSize: 20, fontWeight: 800, minWidth: 0, flex: 1 }}
                placeholder="Untitled" />
            ) : (
              <span style={{ color: '#cdd6f4', fontSize: 20, fontWeight: 800 }}>{doc.title || 'Untitled'}</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* Save status */}
            {savingStatus && (
              <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 5,
                color: savingStatus === 'saved' ? '#a6e3a1' : savingStatus === 'error' ? '#f38ba8' : '#f9e2af' }}>
                {savingStatus === 'saving' && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f9e2af', display: 'inline-block', animation: 'pulse 1.2s infinite' }} />}
                {savingStatus === 'saving' ? 'Saving…' : savingStatus === 'saved' ? '✓ Saved to cloud' : '⚠ Save failed'}
              </span>
            )}

            <span style={{ color: '#6c7086', fontSize: 11 }}>Edited {formatDate(doc.updatedAt)}</span>

            {role === 'editor' && (
              <button onClick={() => setPreview(!preview)}
                style={{ padding: '5px 12px', background: preview ? '#cba6f7' : '#313244', border: 'none', borderRadius: 8, color: preview ? '#1e1e2e' : '#a6adc8', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                {preview ? '✏️ Edit' : '👁 Preview'}
              </button>
            )}

            <button onClick={() => useUIStore.getState().toggleVersionHistory()}
              style={{ padding: '5px 12px', background: versionOpen ? '#cba6f7' : '#313244', border: 'none', borderRadius: 8, color: versionOpen ? '#1e1e2e' : '#a6adc8', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
              ⏰ History
            </button>

            {role === 'editor' && (
              <button onClick={async () => {
                if (window.confirm('Delete this page and all sub-pages?')) {
                  await useDocStore.getState().deleteDocument(uid, selectedId);
                  const nextId = useDocStore.getState().rootDocumentIds[0] || null;
                  useUIStore.getState().selectDocument(nextId);
                }
              }}
                style={{ padding: '5px 10px', background: '#313244', border: 'none', borderRadius: 8, color: '#f38ba8', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                🗑
              </button>
            )}
          </div>
        </div>

        {!preview && <EditorToolbar onFormat={handleFormat} />}

        {/* Content area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '36px 56px 56px', background: '#1e1e2e' }}>
          {role === 'readonly' || preview ? (
            <MarkdownView content={content} />
          ) : (
            <textarea ref={taRef} value={content} onChange={handleContentChange}
              style={{ width: '100%', minHeight: '65vh', background: 'none', border: 'none', outline: 'none', resize: 'none', color: '#cdd6f4', fontSize: 15, lineHeight: 1.85, fontFamily: "'JetBrains Mono','Fira Code',monospace" }}
              placeholder="Start writing… Markdown is supported" />
          )}

          {/* Sub-pages grid */}
          {doc.children?.length > 0 && (
            <div style={{ marginTop: 56, borderTop: '1px solid #313244', paddingTop: 24 }}>
              <div style={{ color: '#6c7086', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Sub-pages</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 10 }}>
                {doc.children.map((cid) => {
                  const c = useDocStore.getState().documents[cid]; if (!c) return null;
                  return (
                    <button key={cid} onClick={() => useUIStore.getState().selectDocument(cid)}
                      style={{ padding: '14px 16px', background: '#181825', border: '1px solid #313244', borderRadius: 12, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12 }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#313244'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#181825'; }}>
                      <span style={{ fontSize: 22 }}>{c.emoji || '📄'}</span>
                      <div>
                        <div style={{ color: '#cdd6f4', fontSize: 13, fontWeight: 600 }}>{c.title || 'Untitled'}</div>
                        <div style={{ color: '#6c7086', fontSize: 11 }}>{formatDate(c.updatedAt)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      {versionOpen && <VersionPanel docId={selectedId} uid={uid} />}
    </div>
  );
}
