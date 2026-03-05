# 🗒️ Mini Notion — Collaborative Document Editor

A feature-rich, Notion-inspired document editor built with React 18, demonstrating advanced frontend patterns including complex state modeling, optimistic updates, conflict resolution, and scalable component architecture.

See it in action here: https://mini-notion-nine.vercel.app/
---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 Nested Documents | Create hierarchical pages with unlimited nesting depth |
| 🔄 Drag & Drop Reorder | Reorder pages in the sidebar via HTML5 drag-and-drop |
| 💾 Autosave | Debounced persistence (800ms) with optimistic updates |
| ⏰ Version History | Up to 25 restorable snapshots per document |
| 👁️ Role System | Toggle between **Editor** and **Read-only** modes |
| 📝 Markdown Support | Full Markdown preview with live editing toolbar |
| 🎨 Emoji Icons | Per-page emoji picker for visual organization |
| ⌨️ Keyboard Shortcuts | `Ctrl+B` sidebar toggle, `Ctrl+N` new page |

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 (Hooks) |
| State Management | Zustand + Immer |
| Drag & Drop | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Persistence | Debounced autosave (upgradeable to any backend) |
| Styling | Inline styles (Catppuccin Mocha theme) |
| Build Tool | Vite |

---

## 📁 Project Structure

```
mini-notion/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx                          # App entry point
    ├── App.jsx                           # Root layout + keyboard shortcuts
    ├── index.css                         # Global styles + scrollbar + animations
    │
    ├── store/
    │   ├── documentStore.js              # Zustand: document CRUD, versions, reorder
    │   └── uiStore.js                    # Zustand: role, sidebar, selection state
    │
    ├── hooks/
    │   ├── useAutosave.js                # Debounced persistence with optimistic update
    │   └── useDebounce.js                # Generic reusable debounce hook
    │
    ├── utils/
    │   ├── immutable.js                  # Immutable tree helpers (Immer patterns)
    │   └── dateUtils.js                  # Timestamp formatting utilities
    │
    └── components/
        ├── Header/
        │   └── Header.jsx                # Top bar with sidebar toggle + role switcher
        │
        ├── RoleToggle/
        │   └── RoleToggle.jsx            # Editor / Read-only segmented control
        │
        ├── EmojiPicker/
        │   └── EmojiPicker.jsx           # Floating emoji grid for page icons
        │
        ├── Sidebar/
        │   ├── Sidebar.jsx               # Sidebar shell + New Page button
        │   ├── DocumentTree.jsx          # Recursive root-level tree renderer
        │   └── DocumentItem.jsx          # Single draggable, collapsible tree node
        │
        ├── Editor/
        │   ├── Editor.jsx                # Main editor shell + autosave orchestration
        │   ├── EditorToolbar.jsx         # Markdown formatting toolbar
        │   └── MarkdownView.jsx          # Read-only Markdown renderer
        │
        └── VersionHistory/
            └── VersionPanel.jsx          # Snapshot list with restore functionality
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/mini-notion.git
cd mini-notion

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🏗️ Architecture Deep Dive

### State Management — Zustand + Immer

All application state is split into two Zustand stores:

**`documentStore.js`** owns all document data:
- Flat map `{ [id]: Document }` for O(1) lookups
- `children: string[]` arrays for tree structure
- Version snapshots array (max 25 per document)
- Saving status per document (`null | 'saving' | 'saved'`)

**`uiStore.js`** owns all UI state:
- Active document selection
- Role (`editor` | `readonly`)
- Sidebar open/close
- Version history panel open/close
- Per-document expand/collapse state

```js
// Example: Immer-based immutable update
updateDocument: (id, changes) =>
  set(produce((state) => {
    Object.assign(state.documents[id], changes, { updatedAt: Date.now() });
  })),
```

### Optimistic Updates

Changes are reflected in the store **immediately** on each keystroke. The debounced save timer fires 800ms after the last edit, capturing a version snapshot. This means:

1. UI always shows the latest state — no loading flicker
2. Version history only snapshots when the user pauses
3. Duplicate snapshots (same title + content) are skipped

```
Keystroke → setState (optimistic) → [800ms pause] → saveVersion()
```

### Debounced Autosave

```js
// hooks/useAutosave.js
const triggerSave = useCallback((title, content) => {
  clearTimeout(timerRef.current);
  setSavingStatus(selectedId, 'saving');
  updateDocument(selectedId, { title, content }); // ← optimistic
  timerRef.current = setTimeout(() => {
    saveVersion(selectedId);                       // ← snapshot
    setSavingStatus(selectedId, 'saved');
  }, 800);
}, [selectedId]);
```

### Immutable Tree Manipulation

Documents are stored in a **flat normalized map** rather than a nested tree. This makes reads O(1) and mutations safe with Immer:

```js
// utils/immutable.js
export const collectDescendants = (tree, id) => {
  const result = [];
  const walk = (nodeId) => {
    result.push(nodeId);
    (tree[nodeId]?.children || []).forEach(walk);
  };
  walk(id);
  return result;
};
```

When deleting a document, all descendants are collected first, then removed from the flat map in a single Immer `produce` call.

### Drag-and-Drop Reorder

Each `DocumentItem` is a native HTML5 drag source and drop target. On drop, the sibling array is reconstructed immutably and written back to the store:

```js
const reordered = siblings.filter(id => id !== dragged);
const targetIdx = reordered.indexOf(dropTargetId);
reordered.splice(targetIdx + 1, 0, dragged);
reorderDocuments(parentId, reordered);
```

> **Production upgrade:** Replace with `@dnd-kit/sortable` for accessible, animated drag-and-drop with keyboard support.

### Role-Based Access Control

A single `role` atom in `uiStore` gates all write paths:
- Toolbar hidden in `readonly` mode
- Title input replaced with static text
- Add / Delete buttons unmounted
- Drag-and-drop disabled (`draggable={role === 'editor'}`)

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + B` / `⌘ + B` | Toggle sidebar |
| `Ctrl + N` / `⌘ + N` | Create new page |
| Edits auto-save after 800ms of inactivity | |

---

## 🔮 Roadmap / Possible Extensions

- [ ] **Backend persistence** — replace `setTimeout` in `useAutosave` with a real API call (REST or WebSocket)
- [ ] **Real-time collaboration** — add CRDT conflict resolution (e.g., Yjs or Automerge)
- [ ] **Rich text editor** — swap `<textarea>` for TipTap or Slate.js
- [ ] **Search** — full-text search across all documents
- [ ] **Export** — download pages as Markdown or PDF
- [ ] **Auth** — multi-user support with per-user workspaces
- [ ] **Tests** — Vitest unit tests for store actions + React Testing Library for components

---

## 🎨 Design System

The UI uses the [Catppuccin Mocha](https://github.com/catppuccin/catppuccin) color palette:

| Token | Hex | Usage |
|---|---|---|
| Base | `#1e1e2e` | Editor background |
| Mantle | `#181825` | Sidebar, toolbar |
| Crust | `#11111b` | Header bar |
| Surface 0 | `#313244` | Buttons, inputs |
| Overlay 0 | `#6c7086` | Muted text, icons |
| Text | `#cdd6f4` | Primary text |
| Mauve | `#cba6f7` | Accent, selections |
| Green | `#a6e3a1` | Save confirmation |
| Red | `#f38ba8` | Delete actions |

---

## 📄 License

MIT — free to use, modify, and distribute.

---

<p align="center">Built with React 18 · Zustand · Immer · Vite</p>
