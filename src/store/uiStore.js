import { create } from 'zustand';

export const useUIStore = create((set) => ({
  selectedDocId: 'doc-1',
  role: 'editor',             // 'editor' | 'readonly'
  sidebarOpen: true,
  versionHistoryOpen: false,
  expanded: { 'doc-1': true, 'doc-2': false },

  selectDocument: (id) => set({ selectedDocId: id, versionHistoryOpen: false }),
  setRole: (role) => set({ role }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleVersionHistory: () => set((s) => ({ versionHistoryOpen: !s.versionHistoryOpen })),
  toggleExpand: (id) => set((s) => ({ expanded: { ...s.expanded, [id]: !s.expanded[id] } })),
  expand: (id) => set((s) => ({ expanded: { ...s.expanded, [id]: true } })),
}));
