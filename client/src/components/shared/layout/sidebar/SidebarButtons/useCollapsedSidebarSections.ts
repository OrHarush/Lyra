import { useState } from 'react';

export type SidebarSectionId = 'manage' | 'admin';

const STORAGE_KEY = 'lyra_sidebar_collapsed_sections';

const readCollapsed = (): SidebarSectionId[] => {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');

    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

// Sections start expanded; only the ones the user collapsed are remembered.
export const useCollapsedSidebarSections = () => {
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const isExpanded = (id: SidebarSectionId) => !collapsed.includes(id);

  const toggleSection = (id: SidebarSectionId) => {
    const next = isExpanded(id) ? [...collapsed, id] : collapsed.filter(other => other !== id);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setCollapsed(next);
  };

  return { isExpanded, toggleSection };
};
