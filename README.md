# 🗒️ Mini Notion — Collaborative Document Editor

A full-stack, Notion-inspired document editor built with React 18, Zustand, and Firebase. Features real-time cloud sync, Google + email authentication, offline support, drag-and-drop reordering, and full version history — all deployable to the web with zero local development environment required.

---

## 🌐 Live Demo

Deployed on Vercel → [mini-notion-nine.vercel.app](https://mini-notion-nine.vercel.app)

---

## ✨ Features

| Feature | Description |
|---|---|
| ☁️ **Cloud Sync** | Real-time Firestore sync — edits appear across all devices instantly |
| 🔐 **Authentication** | Google OAuth + Email/Password sign-in via Firebase Auth |
| 📴 **Offline Support** | IndexedDB persistence — the app works fully without internet |
| 📄 **Nested Documents** | Create pages inside pages with unlimited hierarchy depth |
| 🔄 **Drag & Drop** | Reorder pages in the sidebar — persisted to Firestore |
| 💾 **Autosave** | Debounced 800ms autosave with optimistic updates |
| ⏰ **Version History** | Up to 25 restorable cloud snapshots per document |
| 👁️ **Role System** | Toggle between Editor and Read-only mode |
| 📝 **Markdown** | Full Markdown editing with live preview |
| 🎨 **Emoji Icons** | Per-page emoji picker |
| ⌨️ **Keyboard Shortcuts** | `Ctrl+B` sidebar toggle, `Ctrl+N` new page |

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 with Hooks |
| State Management | Zustand + Immer |
| Cloud Database | Firebase Firestore |
| Authentication | Firebase Auth (Google + Email/Password) |
| Offline Persistence | Firestore IndexedDB cache |
| Drag & Drop | HTML5 native drag-and-drop |
| Build Tool | Vite |
| Deployment | Vercel |

---

## 📁 Project Structure

```
mini-notion/
├── .env.example                              # Firebase env vars template (safe to commit)
├── index.html                                # App entry point
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
│
└── src/
    ├── main.jsx                              # React root
    ├── App.jsx                               # Auth gate + Firestore sync bootstrap
    ├── index.css                             # Global styles + animations
    │
    ├── firebase/
    │   ├── config.js                         # Firebase init + IndexedDB offline persistence
    │   ├── auth.js                           # Auth helpers: Google, email, sign-out
    │   └── firestore.js                      # All Firestore reads, writes, listeners
    │
    ├── store/
    │   ├── documentStore.js                  # Zustand: documents, versions, Firebase writes
    │   └── uiStore.js                        # Zustand: role, sidebar, selection state
    │
    ├── hooks/
    │   ├── useAuth.js                        # Firebase auth state observer
    │   ├── useFirestoreSync.js               # Bootstrap + real-time onSnapshot subscriptions
    │   ├── useAutosave.js                    # Debounced Firestore persistence hook
    │   └── useDebounce.js                    # Generic debounce hook
    │
    ├── utils/
    │   ├── immutable.js                      # Immutable tree helpers (Immer patterns)
    │   └── dateUtils.js                      # Timestamp formatting utilities
    │
    └── components/
        ├── Auth/
        │   └── AuthScreen.jsx                # Sign-in / Sign-up / Password reset UI
        ├── Header/
        │   └── Header.jsx                    # Top bar: sync status, user menu, sign-out
        ├── RoleToggle/
        │   └── RoleToggle.jsx                # Editor / Read-only segmented control
        ├── EmojiPicker/
        │   └── EmojiPicker.jsx               # Floating emoji grid
        ├── Sidebar/
        │   ├── Sidebar.jsx                   # Sidebar shell + New Page button
        │   └── DocumentItem.jsx              # Draggable, collapsible tree node
        ├── Editor/
        │   ├── Editor.jsx                    # Main editor + autosave orchestration
        │   ├── EditorToolbar.jsx             # Markdown formatting toolbar
        │   └── MarkdownView.jsx              # Read-only Markdown renderer
        └── VersionHistory/
            └── VersionPanel.jsx              # Version list + Firestore restore
```

---

## 🚀 Deployment Guide

This project is designed to be deployed entirely through the browser — no local development environment needed.

### Step 1 — Set Up Firebase

**Create a Firebase project:**
1. Go to [firebase.google.com](https://firebase.google.com) and sign in with your Google account
2. Click **Create a project**, name it `mini-notion`, disable Google Analytics, click **Create**
3. Once ready, click **Continue**

**Register a Web App:**
1. On the project dashboard, click the **Web** icon (`</>`)
2. Give it a nickname like `mini-notion-web` and click **Register app**
3. Copy the `firebaseConfig` values shown — you'll need these in Step 3

**Enable Authentication:**
1. Go to **Build → Authentication → Get started**
2. Click **Google** → toggle Enable → add your support email → **Save**
3. Click **Email/Password** → toggle Enable → **Save**

**Create Firestore Database:**
1. Go to **Build → Firestore Database → Create database**
2. Choose **Production mode**, pick a region close to you, click **Enable**
3. Go to the **Rules** tab and replace the contents with:

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

4. Click **Publish**

---

### Step 2 — Push Code to GitHub

1. Go to [github.com](https://github.com) → **New repository** → name it `mini-notion`
2. Upload the contents of the `mini-notion-firebase.zip` (unzipped) to the repo
3. Make sure `package.json` and `index.html` are at the root level
4. ⚠️ Do **not** upload `.env.local` — only `.env.example` is safe to commit

---

### Step 3 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **Sign up with GitHub**
2. Click **Add New → Project** → import your `mini-notion` repository
3. Vercel auto-detects Vite — the default settings are correct
4. **Before clicking Deploy**, scroll to **Environment Variables** and add all 6 Firebase values:

| Variable Name | Where to find the value |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase → Project Settings → Your App |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase → Project Settings → Your App |
| `VITE_FIREBASE_PROJECT_ID` | Firebase → Project Settings → Your App |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase → Project Settings → Your App |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase → Project Settings → Your App |
| `VITE_FIREBASE_APP_ID` | Firebase → Project Settings → Your App |

5. Click **Deploy** — your live URL will be ready in about 60 seconds

---

### Step 4 — Authorize Your Domain for Google Sign-In

Google sign-in requires two separate places to be updated. Both are required.

**In Firebase Console:**
1. Go to **Authentication → Settings → Authorized domains**
2. Click **Add domain** and enter your Vercel URL without `https://`:
   ```
   your-app.vercel.app
   ```

**In Google Cloud Console:**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Select your Firebase project from the top-left dropdown
3. Go to **APIs & Services → Credentials**
4. Click the **Web client (auto created by Google Service)** OAuth 2.0 client
5. Under **Authorized JavaScript origins** click **Add URI** and enter:
   ```
   https://your-app.vercel.app
   ```
6. Under **Authorized redirect URIs** click **Add URI** and enter:
   ```
   https://your-app.vercel.app/__/auth/handler
   ```
7. Click **Save** and wait 5 minutes for the changes to take effect

---

### Step 5 — Verify Everything Works

1. Open your Vercel URL
2. Sign in with Google or create an email/password account
3. Create a page, type something, and look for **✓ Saved to cloud** in the header
4. Open **Firebase Console → Firestore Database → Data** — a `workspaces` collection will appear with your user ID inside it

The database starts completely empty — this is normal. Firestore creates all collections and documents automatically the first time a user signs in.

---

## ♾️ Making Updates (No Local Environment Needed)

Once deployed, all code changes follow this simple workflow:

1. Open any file in your GitHub repository
2. Click the **pencil ✏️ icon** to edit it directly in the browser
3. Make your changes and click **Commit changes**
4. Vercel automatically detects the new commit and redeploys in ~60 seconds
5. Your live URL updates — no terminal, no local setup required

---

## 🏗️ Architecture

### Firebase Data Model

```
Firestore
└── workspaces/
    └── {userId}/                     ← isolated workspace per user
        ├── meta/
        │   └── workspace             ← { rootDocumentIds: string[] }
        ├── documents/
        │   └── {docId}               ← document content + metadata
        └── versions/
            └── {docId}/
                └── snapshots/
                    └── {snapId}      ← immutable version snapshot
```

Each user gets a fully isolated workspace. The Firestore security rules ensure users can only access their own data — no user can read or write another user's workspace.

### Optimistic Updates

The UI never waits for Firestore. Every change is applied to the Zustand store immediately, then persisted to Firestore after an 800ms debounce. The editor always feels instant regardless of network speed.

```
User types
  → Local Zustand state updates instantly  (no lag)
  → [800ms pause after last keystroke]
  → Firestore write fires
  → Version snapshot saved
  → "✓ Saved to cloud" indicator shown
```

### Conflict Resolution

If a remote Firestore update arrives while the user is actively editing, the local version is preserved when its `updatedAt` timestamp is newer. This prevents cloud sync from overwriting unsaved in-progress edits.

### Offline Support

`enableIndexedDbPersistence()` in `firebase/config.js` caches all Firestore data locally. When offline, reads are served from cache and writes are queued. Everything syncs automatically the moment connectivity is restored — no extra code required.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl / ⌘ + B` | Toggle sidebar open and closed |
| `Ctrl / ⌘ + N` | Create a new root-level page |
| Auto | All edits save 800ms after you stop typing |

---

## 🛠️ Troubleshooting

| Problem | Most Likely Cause | Fix |
|---|---|---|
| Google button — "This site can't be reached" | Missing OAuth origins in Google Cloud Console | Add your Vercel domain to Authorized JavaScript Origins in Google Cloud → APIs & Services → Credentials |
| `auth/unauthorized-domain` in console | Vercel domain not added to Firebase | Firebase → Auth → Settings → Authorized Domains → Add domain |
| `auth/popup-closed-by-user` | Browser blocked the popup | Disable popup blocker for your site, or switch to `signInWithRedirect` |
| Firebase values showing as `undefined` | Env vars missing or app not redeployed | Vercel → Settings → Environment Variables → verify all 6 exist → Redeploy |
| Firestore data tab stays empty | Rules not published or auth failing | Re-publish Firestore security rules; check F12 console for auth errors |
| Build fails on Vercel | `package.json` not at repo root | Ensure files were uploaded to repo root, not inside a subfolder |
| "✓ Saved to cloud" never appears | Firestore write failing silently | Open F12 → Console and look for Firebase error messages |
| Data disappears after page refresh | Firestore write not completing before navigation | Check F12 → Network tab for failed requests to Firestore |
| Google sign-in works locally but not on Vercel | Production domain not authorized | Repeat Step 4 with your exact Vercel URL |

---

## 🔮 Roadmap

- [ ] **Real-time collaboration** — Yjs + y-firestore for CRDT-based concurrent editing with live cursors
- [ ] **Rich text editor** — TipTap or Slate.js replacing the plain `<textarea>`
- [ ] **Workspace sharing** — invite other users with editor or read-only roles
- [ ] **Full-text search** — Algolia or Typesense connected via Cloud Functions
- [ ] **Export** — download any page as Markdown or PDF
- [ ] **Mobile responsive layout** — collapsible sidebar for phones and tablets
- [ ] **Tests** — Vitest unit tests for store actions, Playwright E2E tests for key flows

---

## 🎨 Design System

Built with the [Catppuccin Mocha](https://github.com/catppuccin/catppuccin) dark color palette.

| Token | Hex | Usage |
|---|---|---|
| Base | `#1e1e2e` | Main editor background |
| Mantle | `#181825` | Sidebar and toolbar backgrounds |
| Crust | `#11111b` | Header bar |
| Surface 0 | `#313244` | Buttons and input backgrounds |
| Overlay 0 | `#6c7086` | Muted text and icons |
| Text | `#cdd6f4` | Primary text |
| Mauve | `#cba6f7` | Accent color, active selections |
| Green | `#a6e3a1` | Save confirmation, success states |
| Yellow | `#f9e2af` | Saving in progress indicator |
| Red | `#f38ba8` | Delete actions and error states |

---

## 📄 License

MIT — free to use, modify, and distribute.

---

<p align="center">Built with React 18 · Zustand · Firebase · Vite · Deployed on Vercel</p>
