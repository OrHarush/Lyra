import { Box, List } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import AdminNavigation from '@/components/shared/layout/sidebar/SidebarButtons/AdminNavigation';
import {
  buildAdminNavigationButtons,
  calculatorsButton,
  fixedExpensesButton,
  investmentsButton,
  isSidebarButtonActive,
  manageNavigation,
} from '@/components/shared/layout/sidebar/SidebarButtons/sidebarButtonUtils';
import SidebarNavigationButton, {
  SidebarButtonConfig,
} from '@/components/shared/layout/sidebar/SidebarButtons/SidebarNavigationButton';
import SidebarSection from '@/components/shared/layout/sidebar/SidebarButtons/SidebarSection';
import {
  SIDEBAR_SUBTITLE_HEIGHT,
  SidebarButtonsStyles,
} from '@/components/shared/layout/sidebar/SidebarButtons/styles';
import { useCollapsedSidebarSections } from '@/components/shared/layout/sidebar/SidebarButtons/useCollapsedSidebarSections';
import { useAuth } from '@/providers/AuthProvider';
import { isAdmin } from '@/utils/env';

const MobileSidebarButtons = () => {
  const { t } = useTranslation('sidebar');
  const location = useLocation();
  const { user } = useAuth();
  const { isExpanded, toggleSection } = useCollapsedSidebarSections();
  const mainNavigation = [fixedExpensesButton, investmentsButton, calculatorsButton];
  const adminNavigation = buildAdminNavigationButtons(isAdmin(user));

  // Collapsed rows take no space, so the highlight counts only the visible ones.
  const visibleRows = [
    ...mainNavigation,
    ...(isExpanded('manage') ? manageNavigation : []),
    ...(isExpanded('admin') ? adminNavigation : []),
  ];
  const activeIndex = visibleRows.findIndex(button =>
    isSidebarButtonActive(button, location.pathname)
  );
  const activeRow = visibleRows[activeIndex];
  const titlesAboveActive = adminNavigation.includes(activeRow)
    ? 2
    : Number(manageNavigation.includes(activeRow));

  const renderButton = (button: SidebarButtonConfig) => (
    <SidebarNavigationButton
      key={button.titleKey}
      button={button}
      isActive={isSidebarButtonActive(button, location.pathname)}
      title={t(button.titleKey)}
    />
  );

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        sx={SidebarButtonsStyles(activeIndex, titlesAboveActive * SIDEBAR_SUBTITLE_HEIGHT)}
      />
      <List sx={{ position: 'relative', zIndex: 1 }}>
        {mainNavigation.map(renderButton)}
        <SidebarSection
          title={t('manage')}
          isExpanded={isExpanded('manage')}
          onToggle={() => toggleSection('manage')}
        >
          {manageNavigation.map(renderButton)}
        </SidebarSection>
        {adminNavigation.length > 0 && (
          <SidebarSection
            title={t('admin')}
            isExpanded={isExpanded('admin')}
            onToggle={() => toggleSection('admin')}
          >
            <AdminNavigation adminNavigation={adminNavigation} />
          </SidebarSection>
        )}
      </List>
    </Box>
  );
};

export default MobileSidebarButtons;
