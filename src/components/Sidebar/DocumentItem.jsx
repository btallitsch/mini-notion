import { useState } from 'react';
import { useDocStore } from '../../store/documentStore';
import { useUIStore } from '../../store/uiStore';

export default function DocumentItem({ docId, depth = 0 }) {
  const doc = useDocStore((s) => s.documents[docId]);
  const selectedId = useUIStore((s) => s.selectedDocId);
  const expanded = useUIStore((s) => s.expanded[docId]);
  const role = useUIStore((s) => s.role);
  const { addDocument, reorderDocuments } = useDocStore.getState();
  const { selectDocument, toggleExpand, expand } = useUIStore.getState();

  const [hovered, setHovered] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dragging, setDragging] = useState(false);

  if (!doc) return null;
  const isSelected = selectedId === docId;

  const handleDragStart = (e) => {
    e.dataTransfer.setData('docId', docId);
    e.dataTransfer.setData('parentId', doc.parentId || '');
    setDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragOver(false);
    const dragged = e.dataTransfer.getData('docId');
    const draggedParent = e.dataTransfer.getData('parentId') || null;
    if (dragged === docId) return;
    const state = useDocStore.getState();
    const siblings = draggedParent
      ? state.documents[draggedParent]?.children || []
      : state.rootDocumentIds;
    const reordered = siblings.filter((id) => id !== dragged);
    const targetIdx = reordered.indexOf(docId);
    reordered.splice(targetIdx + 1, 0, dragged);
    reorderDocuments(draggedParent, reordered);
  };

  return (
    <div>
      <div
        draggable={role === 'editor'}
        onDragStart={handleDragStart}
        onDragEnd={() => setDragging(false)}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => {
          selectDocument(docId);
          if (doc.children?.length) toggleExpand(docId);
        }}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          paddingLeft: 10 + depth * 16, paddingRight: 6,
          paddingTop: 5, paddingBottom: 5,
          cursor: 'pointer', borderRadius: 8, margin: '1px 4px',
          background: dragOver ? '#313244' : isSelected ? '#2a2a3e' : hovered ? '#1a1a2e' : 'transparent',
          opacity: dragging ? 0.35 : 1, transition: 'background 0.1s', userSelect: 'none',
          borderLeft: isSelected ? '2px solid #cba6f7' : '2px solid transparent',
        }}>
        <span style={{ fontSize: 9, color: '#6c7086', width: 12, flexShrink: 0 }}>
          {doc.children?.length > 0 ? (expanded ? '▼' : '▶') : ''}
        </span>
        <span style={{ fontSize: 15 }}>{doc.emoji || '📄'}</span>
        <span style={{ flex: 1, fontSize: 13, color: isSelected ? '#cdd6f4' : '#a6adc8',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontWeight: isSelected ? 600 : 400 }}>
          {doc.title || 'Untitled'}
        </span>
        {hovered && role === 'editor' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const id = addDocument(docId);
              selectDocument(id);
              expand(docId);
            }}
            title="Add sub-page"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6c7086', fontSize: 16, padding: '0 2px', lineHeight: 1 }}>+</button>
        )}
      </div>
      {expanded && doc.children?.map((cid) => (
        <DocumentItem key={cid} docId={cid} depth={depth + 1} />
      ))}
    </div>
  );
}
