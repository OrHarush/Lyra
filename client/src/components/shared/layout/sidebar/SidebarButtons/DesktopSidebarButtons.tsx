import { Box, Divider, List } from '@mui/material';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import CollapsibleNavGroup from '@/components/shared/layout/sidebar/SidebarButtons/CollapsibleNavGroup';
import {
  buildDesktopNavSections,
  DesktopNavSection,
} from '@/components/shared/layout/sidebar/SidebarButtons/desktopNavSections';
import { getActiveRowTop } from '@/components/shared/layout/sidebar/SidebarButtons/getActiveRowTop';
import NavGroupHeader from '@/components/shared/layout/sidebar/SidebarButtons/NavGroupHeader';
import { isSidebarButtonActive } from '@/components/shared/layout/sidebar/SidebarButtons/sidebarButtonUtils';
import SidebarNavigationButton, {
  SidebarButtonConfig,
} from '@/components/shared/layout/sidebar/SidebarButtons/SidebarNavigationButton';
import {
  getDesktopDividerStyle,
  getDesktopHighlightStyle,
} from '@/components/shared/layout/sidebar/SidebarButtons/styles';
import { useDesktopNavToggles } from '@/components/shared/layout/sidebar/SidebarButtons/useDesktopNavToggles';
import { useSidebar } from '@/components/shared/layout/sidebar/SidebarContext';
import { ROUTES } from '@/constants/Routes';
import { useReviewCount } from '@/hooks/entities/useTransactionReview';
import { useAuth } from '@/providers/AuthProvider';
import { isAdmin } from '@/utils/env';

const DesktopSidebarButtons = () => {
  const { t } = useTranslation('sidebar');
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { expanded } = useSidebar();
  const { data: reviewCountData } = useReviewCount(!!user);
  const sections = buildDesktopNavSections(isAdmin(user));
  const { isToggledOpen, toggleSection } = useDesktopNavToggles(sections, pathname);

  const reviewCount = reviewCountData?.count ?? 0;

  // The mini sidebar has no toggle rows, so every section shows its items there.
  const isSectionOpen = (section: DesktopNavSection) =>
    !expanded || !section.toggleIcon || isToggledOpen(section.id);

  const withReviewBadge = (button: SidebarButtonConfig) =>
    button.route === ROUTES.TRANSACTIONS_URL && reviewCount > 0
      ? { ...button, badge: String(reviewCount) }
      : button;

  const renderButton = (button: SidebarButtonConfig, nested: boolean) => (
    <SidebarNavigationButton
      key={button.titleKey}
      button={withReviewBadge(button)}
      isActive={isSidebarButtonActive(button, pathname)}
      title={t(button.titleKey)}
      nested={nested}
      compact
    />
  );

  const renderSection = (section: DesktopNavSection) => {
    if (section.toggleIcon && section.titleKey) {
      return (
        <CollapsibleNavGroup
          title={t(section.titleKey)}
          icon={section.toggleIcon}
          hasActiveItem={section.items.some(button => isSidebarButtonActive(button, pathname))}
          isOpen={isToggledOpen(section.id)}
          onToggle={() => toggleSection(section.id)}
        >
          {section.items.map(button => renderButton(button, true))}
        </CollapsibleNavGroup>
      );
    }

    return (
      <>
        {expanded && section.titleKey && <NavGroupHeader title={t(section.titleKey)} />}
        {section.items.map(button => renderButton(button, false))}
      </>
    );
  };

  const activeRowTop = getActiveRowTop({
    sections,
    isSidebarExpanded: expanded,
    isSectionOpen,
    pathname,
  });

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={getDesktopHighlightStyle(activeRowTop)} />
      <List sx={{ position: 'relative', zIndex: 1 }}>
        {sections.map((section, index) => (
          <Fragment key={section.id}>
            {!expanded && index > 0 && <Divider component="li" sx={getDesktopDividerStyle()} />}
            {renderSection(section)}
          </Fragment>
        ))}
      </List>
    </Box>
  );
};

export default DesktopSidebarButtons;
