import { useEffect } from 'react';
import { useDocStore } from './store/documentStore';
import { useUIStore } from './store/uiStore';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Editor from './components/Editor/Editor';

export default function App() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const { addDocument } = useDocStore.getState();
  const { toggleSidebar, selectDocument } = useUIStore.getState();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); toggleSidebar(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); const id = addDocument(null); selectDocument(id); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {sidebarOpen && <Sidebar />}
        <Editor />
      </div>
    </div>
  );
}
