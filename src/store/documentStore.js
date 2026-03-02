import { create } from 'zustand';
import { produce } from 'immer';
import { collectDescendants } from '../utils/immutable';

const INITIAL_DOCS = {
  'doc-1': {
    id: 'doc-1', title: 'Welcome to Mini Notion', emoji: '👋',
    content: `# Welcome to Mini Notion\n\nThis is your collaborative workspace.\n\n## Features\n\n- 📄 **Nested documents** — organize knowledge hierarchically\n- 🔄 **Drag-and-drop** — reorder pages in the sidebar\n- 💾 **Autosave** — changes persist every 800ms of inactivity\n- 👁️ **Role switching** — toggle Editor vs Read-only\n- ⏰ **Version history** — restore any past snapshot\n\n---\n\n> Click any page in the sidebar to begin editing.`,
    parentId: null, order: 0, children: ['doc-2', 'doc-3'],
    createdAt: Date.now() - 86400000, updatedAt: Date.now() - 3600000,
  },
  'doc-2': {
    id: 'doc-2', title: 'Project Notes', emoji: '📝',
    content: `# Project Notes\n\n## Tech Stack\n\n- **React 18** with hooks\n- **Zustand** for scalable state management\n- **Immer** for immutable data patterns\n- **@dnd-kit** for accessible drag and drop\n- **Debounced autosave** — 800ms persistence window\n\n---\n\n## Architecture\n\nAll document state lives in a single Zustand store.\nComponents are purely presentational.\nVersion history stores up to 25 immutable snapshots per document.`,
    parentId: 'doc-1', order: 0, children: ['doc-4'],
    createdAt: Date.now() - 72000000, updatedAt: Date.now() - 1800000,
  },
  'doc-3': {
    id: 'doc-3', title: 'Meeting Notes', emoji: '🗓️',
    content: `# Meeting Notes\n\n## March 2026\n\n- [x] Define MVP scope\n- [x] Initial prototype complete\n- [ ] Write unit tests\n- [ ] Deploy to staging\n\n---\n\n## Action Items\n\n- **Alice** → Set up Storybook\n- **Bob** → Write integration tests\n- **Carol** → Deploy pipeline`,
    parentId: 'doc-1', order: 1, children: [],
    createdAt: Date.now() - 43200000, updatedAt: Date.now() - 900000,
  },
  'doc-4': {
    id: 'doc-4', title: 'Keyboard Shortcuts', emoji: '⌨️',
    content: `# Keyboard Shortcuts\n\n| Action | Mac | Windows |\n|--------|-----|---------|\n| Toggle sidebar | ⌘B | Ctrl+B |\n| New page | ⌘N | Ctrl+N |\n| Save | Auto | Auto |\n\n---\n\nAll changes are **automatically saved** after 800ms.`,
    parentId: 'doc-2', order: 0, children: [],
    createdAt: Date.now() - 21600000, updatedAt: Date.now() - 600000,
  },
};

export const useDocStore = create((set, get) => ({
  documents: INITIAL_DOCS,
  rootDocumentIds: ['doc-1'],
  versions: { 'doc-1': [], 'doc-2': [], 'doc-3': [], 'doc-4': [] },
  savingStatus: {},

  addDocument: (parentId) => {
    const id = `doc-${Date.now()}`;
    const doc = {
      id, title: 'Untitled', emoji: '📄', content: '',
      parentId: parentId || null, order: Date.now(),
      children: [], createdAt: Date.now(), updatedAt: Date.now(),
    };
    set(produce((s) => {
      s.documents[id] = doc;
      s.versions[id] = [];
      if (parentId && s.documents[parentId]) {
        s.documents[parentId].children.push(id);
      } else {
        s.rootDocumentIds.push(id);
      }
    }));
    return id;
  },

  updateDocument: (id, changes) => {
    set(produce((s) => {
      if (!s.documents[id]) return;
      Object.assign(s.documents[id], changes, { updatedAt: Date.now() });
    }));
  },

  saveVersion: (id) => {
    set(produce((s) => {
      const doc = s.documents[id]; if (!doc) return;
      const prev = s.versions[id]?.[0];
      if (prev?.content === doc.content && prev?.title === doc.title) return;
      const snap = { id: `v-${Date.now()}`, content: doc.content, title: doc.title, emoji: doc.emoji, savedAt: Date.now() };
      s.versions[id] = [snap, ...(s.versions[id] || [])].slice(0, 25);
    }));
  },

  restoreVersion: (docId, versionId) => {
    const v = get().versions[docId]?.find(x => x.id === versionId);
    if (!v) return;
    set(produce((s) => {
      s.documents[docId].content = v.content;
      s.documents[docId].title = v.title;
      s.documents[docId].updatedAt = Date.now();
    }));
  },

  deleteDocument: (id) => {
    const tree = get().documents;
    const toDelete = collectDescendants(tree, id);
    const doc = tree[id];
    set(produce((s) => {
      toDelete.forEach(did => { delete s.documents[did]; delete s.versions[did]; });
      if (doc?.parentId && s.documents[doc.parentId]) {
        s.documents[doc.parentId].children = s.documents[doc.parentId].children.filter(c => c !== id);
      }
      s.rootDocumentIds = s.rootDocumentIds.filter(r => !toDelete.includes(r));
    }));
  },

  reorderDocuments: (parentId, orderedIds) => {
    set(produce((s) => {
      orderedIds.forEach((id, i) => { if (s.documents[id]) s.documents[id].order = i; });
      if (parentId && s.documents[parentId]) {
        s.documents[parentId].children = orderedIds;
      } else {
        s.rootDocumentIds = orderedIds;
      }
    }));
  },

  setEmoji: (id, emoji) => {
    set(produce((s) => { if (s.documents[id]) { s.documents[id].emoji = emoji; s.documents[id].updatedAt = Date.now(); } }));
  },

  setSavingStatus: (id, status) => {
    set(produce((s) => { s.savingStatus[id] = status; }));
  },
}));
