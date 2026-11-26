import { Box, List, ListSubheader } from '@mui/material';
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
import {
  getSidebarSubtitleStyle,
  SIDEBAR_SUBTITLE_HEIGHT,
  SidebarButtonsStyles,
} from '@/components/shared/layout/sidebar/SidebarButtons/styles';
import { useAuth } from '@/providers/AuthProvider';
import { isAdmin } from '@/utils/env';

const MobileSidebarButtons = () => {
  const { t } = useTranslation('sidebar');
  const location = useLocation();
  const { user } = useAuth();
  const mainNavigation = [fixedExpensesButton, investmentsButton, calculatorsButton];

  const adminNavigation = buildAdminNavigationButtons(isAdmin(user));
  const rows = [...mainNavigation, ...manageNavigation, ...adminNavigation];
  const activeIndex = rows.findIndex(button => isSidebarButtonActive(button, location.pathname));
  const subtitleOffset = activeIndex >= mainNavigation.length ? SIDEBAR_SUBTITLE_HEIGHT : 0;

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
      <Box sx={SidebarButtonsStyles(activeIndex, subtitleOffset)} />
      <List sx={{ position: 'relative', zIndex: 1 }}>
        {mainNavigation.map(renderButton)}
        <ListSubheader disableSticky sx={getSidebarSubtitleStyle()}>
          {t('manage')}
        </ListSubheader>
        {manageNavigation.map(renderButton)}
        <AdminNavigation adminNavigation={adminNavigation} />
      </List>
    </Box>
  );
};

export default MobileSidebarButtons;
