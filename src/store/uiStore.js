// src/store/uiStore.js

import { create } from 'zustand';

export const useUIStore = create((set) => ({
  selectedDocId: null,
  role: 'editor',            // 'editor' | 'readonly'
  sidebarOpen: true,
  versionHistoryOpen: false,
  expanded: {},

  selectDocument: (id) => set({ selectedDocId: id, versionHistoryOpen: false }),
  setRole: (role) => set({ role }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleVersionHistory: () => set((s) => ({ versionHistoryOpen: !s.versionHistoryOpen })),
  toggleExpand: (id) => set((s) => ({ expanded: { ...s.expanded, [id]: !s.expanded[id] } })),
  setExpanded: (id, val) => set((s) => ({ expanded: { ...s.expanded, [id]: val } })),
  expand: (id) => set((s) => ({ expanded: { ...s.expanded, [id]: true } })),
}));
