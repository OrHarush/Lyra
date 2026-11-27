import { DesktopNavSection } from '@/components/shared/layout/sidebar/SidebarButtons/desktopNavSections';
import { isSidebarButtonActive } from '@/components/shared/layout/sidebar/SidebarButtons/sidebarButtonUtils';
import {
  DESKTOP_DIVIDER_HEIGHT,
  DESKTOP_HEADER_HEIGHT,
  DESKTOP_LIST_PADDING,
  DESKTOP_ROW_GAP,
  DESKTOP_ROW_HEIGHT,
} from '@/components/shared/layout/sidebar/SidebarButtons/styles';

interface ActiveRowTopParams {
  sections: DesktopNavSection[];
  isSidebarExpanded: boolean;
  isSectionOpen: (section: DesktopNavSection) => boolean;
  pathname: string;
}

// The sliding highlight is positioned absolutely, so it adds up everything rendered above the row.
export const getActiveRowTop = ({
  sections,
  isSidebarExpanded,
  isSectionOpen,
  pathname,
}: ActiveRowTopParams): number | null => {
  const rowPitch = DESKTOP_ROW_HEIGHT + DESKTOP_ROW_GAP * 2;
  let top = DESKTOP_LIST_PADDING;

  for (const [index, section] of sections.entries()) {
    if (!isSidebarExpanded && index > 0) {
      top += DESKTOP_DIVIDER_HEIGHT;
    }

    if (isSidebarExpanded && section.titleKey) {
      top += section.toggleIcon ? rowPitch : DESKTOP_HEADER_HEIGHT;
    }

    if (!isSectionOpen(section)) {
      continue;
    }

    const activeIndex = section.items.findIndex(button => isSidebarButtonActive(button, pathname));

    if (activeIndex >= 0) {
      return top + activeIndex * rowPitch + DESKTOP_ROW_GAP;
    }

    top += section.items.length * rowPitch;
  }

  return null;
};
