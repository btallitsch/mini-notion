# 🗒️ Mini Notion — Collaborative Document Editor with Firebase Cloud Sync

A feature-rich, Notion-inspired document editor built with React 18, Zustand, and Firebase — featuring real-time cloud sync, offline support, Google authentication, and full version history stored in Firestore.

---

## ✨ Features

| Feature | Description |
|---|---|
| ☁️ Firebase Cloud Sync | Real-time Firestore sync — changes appear instantly across all devices |
| 🔐 Authentication | Google OAuth + Email/Password sign-in via Firebase Auth |
| 📴 Offline Support | IndexedDB persistence — reads and writes work fully offline |
| 📄 Nested Documents | Hierarchical pages with unlimited nesting |
| 🔄 Drag & Drop Reorder | Reorder pages via HTML5 drag-and-drop, persisted to Firestore |
| 💾 Autosave | Debounced 800ms autosave with optimistic updates |
| ⏰ Version History | Up to 25 restorable Firestore snapshots per document |
| 👁️ Role System | Editor / Read-only toggle |
| 📝 Markdown | Full Markdown editing + live preview |
| 🎨 Emoji Icons | Per-page emoji picker |
| ⌨️ Keyboard Shortcuts | `Ctrl+B` sidebar, `Ctrl+N` new page |

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 (Hooks) |
| State Management | Zustand + Immer |
| Cloud Database | Firebase Firestore |
| Authentication | Firebase Auth (Google + Email/Password) |
| Offline Persistence | Firestore IndexedDB cache |
| Drag & Drop | HTML5 native (upgradeable to @dnd-kit) |
| Build Tool | Vite |

---

## 📁 Project Structure

```
mini-notion/
├── .env.example                          # Firebase env vars template
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx                          # React entry point
    ├── App.jsx                           # Root: auth gate + sync bootstrap
    ├── index.css                         # Global styles
    │
    ├── firebase/
    │   ├── config.js                     # Firebase init + IndexedDB persistence
    │   ├── auth.js                       # Auth helpers (Google, email, sign-out)
    │   └── firestore.js                  # All Firestore CRUD + onSnapshot listeners
    │
    ├── store/
    │   ├── documentStore.js              # Zustand: docs, versions, Firebase writes
    │   └── uiStore.js                    # Zustand: role, sidebar, selection
    │
    ├── hooks/
    │   ├── useAuth.js                    # Firebase auth state observer
    │   ├── useFirestoreSync.js           # Bootstrap + real-time subscription
    │   ├── useAutosave.js                # Debounced Firestore persistence
    │   └── useDebounce.js                # Generic debounce hook
    │
    ├── utils/
    │   ├── immutable.js                  # Tree manipulation helpers
    │   └── dateUtils.js                  # Timestamp formatting
    │
    └── components/
        ├── Auth/AuthScreen.jsx           # Sign-in / Sign-up / Reset UI
        ├── Header/Header.jsx             # Top bar: sync status + user menu
        ├── RoleToggle/RoleToggle.jsx     # Editor / Read-only control
        ├── EmojiPicker/EmojiPicker.jsx   # Floating emoji selector
        ├── Sidebar/
        │   ├── Sidebar.jsx               # Sidebar shell
        │   └── DocumentItem.jsx          # Draggable tree node
        ├── Editor/
        │   ├── Editor.jsx                # Main editor + autosave orchestration
        │   ├── EditorToolbar.jsx         # Markdown formatting toolbar
        │   └── MarkdownView.jsx          # Read-only Markdown renderer
        └── VersionHistory/
            └── VersionPanel.jsx          # Version list + Firestore restore
```

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/your-username/mini-notion.git
cd mini-notion
npm install
```

### 2. Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** and follow the prompts
3. From the project dashboard, click **Add app → Web**
4. Register the app and copy the `firebaseConfig` object

### 3. Enable Firebase Services

In the Firebase Console:

**Authentication:**
- Go to **Build → Authentication → Sign-in method**
- Enable **Google**
- Enable **Email/Password**

**Firestore:**
- Go to **Build → Firestore Database → Create database**
- Start in **production mode**
- Paste these security rules under the **Rules** tab:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /workspaces/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Configure Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your Firebase config values:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
```

### 5. Run

```bash
npm run dev
# → http://localhost:5173
```

---

## 🏗️ Architecture Deep Dive

### Firebase Data Model

```
workspaces/
  {userId}/
    meta/
      workspace          ← { rootDocumentIds: string[] }
    documents/
      {docId}            ← Document fields + content
    versions/
      {docId}/
        snapshots/
          {snapId}       ← Version snapshot
```

Each user gets a fully isolated workspace under `workspaces/{uid}`. The Firestore security rules enforce that only the authenticated user can read or write their own workspace.

### Real-Time Sync Flow

```
onSnapshot(documents) → applyRemoteChanges()
                          ↓
               Conflict check: skip if local.updatedAt > remote.updatedAt
                          ↓
               Zustand store updated → React re-renders
```

Remote changes from other devices arrive via `onSnapshot` listeners and are merged into the Zustand store. If the user is currently editing a document, their unsaved local version is preserved (last-write-wins protection).

### Optimistic Updates

```
User types
  → Local state updates instantly  (no lag)
  → Zustand store updated          (optimistic)
  → [800ms silence]
  → Firestore write                (persist)
  → Version snapshot saved
  → "✓ Saved to cloud" indicator
```

The UI never waits for Firestore — all changes are reflected immediately. If the Firestore write fails, the error is surfaced and the local state is preserved.

### Offline Support

Firestore's `enableIndexedDbPersistence()` caches all reads locally. When offline:
- All reads are served from the IndexedDB cache
- Writes are queued locally
- Everything syncs automatically when connectivity is restored

This means the app is **fully functional offline** with no additional code.

### Conflict Resolution

Currently uses **last-write-wins with local priority** — if the local copy is newer than the incoming remote change, the remote update is skipped. This prevents remote syncs from clobbering in-progress edits.

For true multi-user concurrent editing, upgrade to **Yjs + y-firestore** (CRDTs).

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/⌘ + B` | Toggle sidebar |
| `Ctrl/⌘ + N` | Create new page |
| Edits autosave after 800ms of inactivity | |

---

## 🔧 Local Emulator (Optional)

For development without hitting production Firebase:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and init
firebase login
firebase init emulators  # select Auth + Firestore

# Start emulators
firebase emulators:start
```

Then uncomment the emulator lines in `src/firebase/config.js`:

```js
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

---

## 🔮 Roadmap

- [ ] **Real-time collaboration** — Yjs + y-firestore for CRDT-based concurrent editing
- [ ] **Rich text editor** — TipTap or Slate.js to replace `<textarea>`
- [ ] **Workspace sharing** — invite users with `editor` or `readonly` roles
- [ ] **Full-text search** — Algolia or Typesense via Firestore write triggers
- [ ] **Export** — download pages as Markdown or PDF
- [ ] **Tests** — Vitest for store actions, React Testing Library for components

---

## 🎨 Design System

Built with the [Catppuccin Mocha](https://github.com/catppuccin/catppuccin) palette.

| Token | Hex | Usage |
|---|---|---|
| Base | `#1e1e2e` | Editor background |
| Mantle | `#181825` | Sidebar, toolbar |
| Crust | `#11111b` | Header bar |
| Surface 0 | `#313244` | Buttons, inputs |
| Text | `#cdd6f4` | Primary text |
| Mauve | `#cba6f7` | Accent, selections |
| Green | `#a6e3a1` | Save confirmation |
| Red | `#f38ba8` | Delete actions |

---

## 📄 License

MIT — free to use, modify, and distribute.

---

<p align="center">Built with React 18 · Zustand · Firebase · Vite</p>
