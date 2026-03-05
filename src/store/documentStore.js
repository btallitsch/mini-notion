// src/store/documentStore.js
//
// Zustand document store — source of truth for all document state.
// Firebase operations are triggered here; components never call
// Firestore directly.

import { create } from 'zustand';
import { produce } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import {
  createDocument,
  updateDocument,
  deleteDocumentTree,
  saveVersion as saveVersionToFirestore,
  saveRootOrder,
} from '../firebase/firestore';
import { collectDescendants } from '../utils/immutable';

// ─── Seed content for new users ───────────────────────────────────────────────

const makeSeedDocs = () => {
  const now = Date.now();
  return {
    'doc-1': {
      id: 'doc-1', title: 'Welcome to Mini Notion', emoji: '👋',
      content: `# Welcome to Mini Notion\n\nYour workspace is synced to the cloud in real time.\n\n## Features\n\n- 📄 **Nested pages** — unlimited hierarchy\n- 🔄 **Drag-and-drop** reorder in the sidebar\n- 💾 **Autosave** — 800ms debounce, synced to Firestore\n- ⏰ **Version history** — restore any snapshot\n- 👁️ **Read-only mode** — share safely\n- ☁️ **Cloud sync** — access from any device\n\n---\n\n> Start editing or create a new page with **+ New Page**.`,
      parentId: null, order: 0, children: ['doc-2', 'doc-3'],
      createdAt: now - 3600000, updatedAt: now - 1800000,
    },
    'doc-2': {
      id: 'doc-2', title: 'Project Notes', emoji: '📝',
      content: `# Project Notes\n\n## Tech Stack\n\n- **React 18** — UI framework\n- **Zustand + Immer** — state management\n- **Firebase** — auth + Firestore + offline persistence\n- **@dnd-kit** — accessible drag and drop\n- Debounced autosave with optimistic updates`,
      parentId: 'doc-1', order: 0, children: ['doc-4'],
      createdAt: now - 7200000, updatedAt: now - 3600000,
    },
    'doc-3': {
      id: 'doc-3', title: 'Meeting Notes', emoji: '🗓️',
      content: `# Meeting Notes\n\n- [x] Initial prototype\n- [x] Firebase integration\n- [ ] Unit tests\n- [ ] Deploy to production`,
      parentId: 'doc-1', order: 1, children: [],
      createdAt: now - 86400000, updatedAt: now - 43200000,
    },
    'doc-4': {
      id: 'doc-4', title: 'Keyboard Shortcuts', emoji: '⌨️',
      content: `# Keyboard Shortcuts\n\n| Action | Shortcut |\n|--------|----------|\n| Toggle sidebar | Ctrl+B / ⌘B |\n| New page | Ctrl+N / ⌘N |`,
      parentId: 'doc-2', order: 0, children: [],
      createdAt: now - 21600000, updatedAt: now - 10800000,
    },
  };
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useDocStore = create((set, get) => ({
  documents: {},
  rootDocumentIds: [],
  versions: {},
  savingStatus: {},   // docId → null | 'saving' | 'saved' | 'error'
  syncStatus: 'idle', // 'idle' | 'loading' | 'synced' | 'error'

  // ── Bootstrap ──────────────────────────────────────────────────────────────

  hydrateFromFirestore: (docMap, rootIds) => {
    set({ documents: docMap, rootDocumentIds: rootIds });
  },

  hydrateVersions: (docId, versions) => {
    set(produce((s) => { s.versions[docId] = versions; }));
  },

  resetStore: () => set({
    documents: {}, rootDocumentIds: [], versions: {},
    savingStatus: {}, syncStatus: 'idle',
  }),

  setSyncStatus: (status) => set({ syncStatus: status }),

  /**
   * Seed a fresh workspace for new users — writes to Firestore.
   */
  seedWorkspace: async (uid) => {
    const seedDocs = makeSeedDocs();
    const rootIds = ['doc-1'];

    // Write all seed docs to Firestore in parallel
    await Promise.all(
      Object.values(seedDocs).map((doc) => createDocument(uid, doc))
    );
    await saveRootOrder(uid, rootIds);

    const versions = {};
    Object.keys(seedDocs).forEach((id) => { versions[id] = []; });

    set({ documents: seedDocs, rootDocumentIds: rootIds, versions });

    // Select the first doc in UI
    const { useUIStore } = await import('./uiStore');
    useUIStore.getState().selectDocument('doc-1');
    useUIStore.getState().setExpanded('doc-1', true);
  },

  // ── Real-time remote change application ───────────────────────────────────

  /**
   * Apply incremental changes from the Firestore onSnapshot listener.
   * Conflict resolution: skip remote update if local copy is newer.
   */
  applyRemoteChanges: (changes) => {
    set(produce((s) => {
      changes.forEach(({ type, doc }) => {
        if (type === 'removed') {
          delete s.documents[doc.id];
          delete s.versions[doc.id];
          return;
        }
        const local = s.documents[doc.id];
        // Skip if local is newer (user is currently editing)
        if (local && local.updatedAt > doc.updatedAt) return;
        s.documents[doc.id] = doc;
        if (!s.versions[doc.id]) s.versions[doc.id] = [];
      });
    }));
  },

  setRootDocumentIds: (ids) => set({ rootDocumentIds: ids }),

  // ── CRUD ──────────────────────────────────────────────────────────────────

  addDocument: async (uid, parentId) => {
    const id = uuidv4();
    const now = Date.now();
    const newDoc = {
      id, title: 'Untitled', emoji: '📄', content: '',
      parentId: parentId || null, order: now,
      children: [], createdAt: now, updatedAt: now,
    };

    // Optimistic: update local store immediately
    set(produce((s) => {
      s.documents[id] = newDoc;
      s.versions[id] = [];
      if (parentId && s.documents[parentId]) {
        s.documents[parentId].children.push(id);
      } else {
        s.rootDocumentIds.push(id);
      }
    }));

    // Persist to Firestore (fire-and-forget — local state is already updated)
    try {
      await createDocument(uid, newDoc);
      if (!parentId) {
        await saveRootOrder(uid, get().rootDocumentIds);
      } else {
        await updateDocument(uid, parentId, {
          children: get().documents[parentId].children,
        });
      }
    } catch (err) {
      console.error('[documentStore] addDocument failed:', err);
    }

    return id;
  },

  /**
   * Optimistic local-only update — used by useAutosave before the
   * debounce fires the actual Firestore write.
   */
  updateDocumentLocal: (id, changes) => {
    set(produce((s) => {
      if (!s.documents[id]) return;
      Object.assign(s.documents[id], changes, { updatedAt: Date.now() });
    }));
  },

  setEmoji: async (uid, id, emoji) => {
    set(produce((s) => {
      if (s.documents[id]) { s.documents[id].emoji = emoji; s.documents[id].updatedAt = Date.now(); }
    }));
    try {
      await updateDocument(uid, id, { emoji });
    } catch (err) {
      console.error('[documentStore] setEmoji failed:', err);
    }
  },

  deleteDocument: async (uid, id) => {
    const tree = get().documents;
    const toDelete = collectDescendants(tree, id);
    const doc = tree[id];

    // Optimistic local removal
    set(produce((s) => {
      toDelete.forEach((did) => { delete s.documents[did]; delete s.versions[did]; });
      if (doc?.parentId && s.documents[doc.parentId]) {
        s.documents[doc.parentId].children =
          s.documents[doc.parentId].children.filter((c) => c !== id);
      }
      s.rootDocumentIds = s.rootDocumentIds.filter((r) => !toDelete.includes(r));
    }));

    // Firestore batch delete
    try {
      await deleteDocumentTree(uid, toDelete);
      await saveRootOrder(uid, get().rootDocumentIds);
    } catch (err) {
      console.error('[documentStore] deleteDocument failed:', err);
    }
  },

  reorderDocuments: async (uid, parentId, orderedIds) => {
    set(produce((s) => {
      orderedIds.forEach((id, i) => { if (s.documents[id]) s.documents[id].order = i; });
      if (parentId && s.documents[parentId]) {
        s.documents[parentId].children = orderedIds;
      } else {
        s.rootDocumentIds = orderedIds;
      }
    }));

    try {
      if (parentId) {
        await updateDocument(uid, parentId, { children: orderedIds });
      } else {
        await saveRootOrder(uid, orderedIds);
      }
    } catch (err) {
      console.error('[documentStore] reorderDocuments failed:', err);
    }
  },

  // ── Version history ───────────────────────────────────────────────────────

  /**
   * Save a version snapshot — deduplicates, then writes to Firestore.
   * Called by useAutosave after the debounce fires.
   */
  saveVersionLocal: async (uid, docId) => {
    const doc = get().documents[docId];
    if (!doc) return;

    const prev = (get().versions[docId] || [])[0];
    if (prev?.content === doc.content && prev?.title === doc.title) return;

    const snap = {
      id: `v-${Date.now()}`,
      content: doc.content,
      title: doc.title,
      emoji: doc.emoji,
      savedAt: Date.now(),
    };

    // Local update
    set(produce((s) => {
      s.versions[docId] = [snap, ...(s.versions[docId] || [])].slice(0, 25);
    }));

    // Firestore persist
    try {
      await saveVersionToFirestore(uid, docId, snap);
    } catch (err) {
      console.error('[documentStore] saveVersion failed:', err);
    }
  },

  restoreVersion: async (uid, docId, versionId) => {
    const version = get().versions[docId]?.find((v) => v.id === versionId);
    if (!version) return;

    set(produce((s) => {
      Object.assign(s.documents[docId], {
        content: version.content,
        title: version.title,
        updatedAt: Date.now(),
      });
    }));

    try {
      await updateDocument(uid, docId, {
        content: version.content,
        title: version.title,
      });
    } catch (err) {
      console.error('[documentStore] restoreVersion failed:', err);
    }
  },

  // ── Status helpers ────────────────────────────────────────────────────────

  setSavingStatus: (id, status) => {
    set(produce((s) => { s.savingStatus[id] = status; }));
  },
}));
