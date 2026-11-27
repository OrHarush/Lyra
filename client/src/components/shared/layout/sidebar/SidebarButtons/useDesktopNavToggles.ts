import { useEffect, useState } from 'react';

import { DesktopNavSection } from '@/components/shared/layout/sidebar/SidebarButtons/desktopNavSections';
import { isSidebarButtonActive } from '@/components/shared/layout/sidebar/SidebarButtons/sidebarButtonUtils';

// Sections start closed and open by themselves when the current page is one of their children.
export const useDesktopNavToggles = (sections: DesktopNavSection[], pathname: string) => {
  const activeToggleId = sections.find(
    section =>
      section.toggleIcon && section.items.some(button => isSidebarButtonActive(button, pathname))
  )?.id;
  const [openIds, setOpenIds] = useState<DesktopNavSection['id'][]>(
    activeToggleId ? [activeToggleId] : []
  );

  useEffect(() => {
    if (!activeToggleId) {
      return;
    }

    setOpenIds(ids => (ids.includes(activeToggleId) ? ids : [...ids, activeToggleId]));
  }, [activeToggleId, pathname]);

  const isToggledOpen = (id: DesktopNavSection['id']) => openIds.includes(id);

  const toggleSection = (id: DesktopNavSection['id']) => {
    setOpenIds(ids => (ids.includes(id) ? ids.filter(other => other !== id) : [...ids, id]));
  };

  return { isToggledOpen, toggleSection };
};
