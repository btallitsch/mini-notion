// src/App.jsx

import { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useFirestoreSync } from './hooks/useFirestoreSync';
import { useDocStore } from './store/documentStore';
import { useUIStore } from './store/uiStore';
import { getRedirectResult } from 'firebase/auth';
import { auth } from './firebase/config';
import AuthScreen from './components/Auth/AuthScreen';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Editor from './components/Editor/Editor';

export default function App() {
  const { user, loading } = useAuth();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  // Bootstrap Firestore sync — subscribes on sign-in, tears down on sign-out
  useFirestoreSync(user);
  
  // Inside App(), add this:
  useEffect(() => {
    getRedirectResult(auth).catch((err) => {
      console.error('Redirect error:', err);
    });
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const onKey = async (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === 'b') { e.preventDefault(); useUIStore.getState().toggleSidebar(); }
      if (mod && e.key === 'n' && user) {
        e.preventDefault();
        const id = await useDocStore.getState().addDocument(user.uid, null);
        useUIStore.getState().selectDocument(id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [user]);

  // Full-screen loading spinner while Firebase resolves auth state
  if (loading) return <LoadingScreen />;

  // Show auth screen if not signed in
  if (!user) return <AuthScreen />;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header user={user} />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {sidebarOpen && <Sidebar uid={user.uid} />}
        <Editor uid={user.uid} />
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ height: '100vh', background: '#11111b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🗒️</div>
        <div style={{ color: '#cdd6f4', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Mini Notion</div>
        <div style={{ color: '#6c7086', fontSize: 13 }}>Loading…</div>
      </div>
    </div>
  );
}
