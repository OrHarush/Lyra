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
import SidebarNavigationButton from '@/components/shared/layout/sidebar/SidebarButtons/SidebarNavigationButton';
import { SidebarButtonsStyles } from '@/components/shared/layout/sidebar/SidebarButtons/styles';
import { useAuth } from '@/providers/AuthProvider';
import { isAdmin } from '@/utils/env';

const MobileSidebarButtons = () => {
  const { t } = useTranslation('sidebar');
  const location = useLocation();
  const { user } = useAuth();
  const mobileNavigation = [
    fixedExpensesButton,
    ...manageNavigation,
    investmentsButton,
    calculatorsButton,
  ];

  const adminNavigation = buildAdminNavigationButtons(isAdmin(user));
  const rows = [...mobileNavigation, ...adminNavigation];
  const activeIndex = rows.findIndex(button => isSidebarButtonActive(button, location.pathname));

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={SidebarButtonsStyles(activeIndex)} />
      <List sx={{ position: 'relative', zIndex: 1 }}>
        {mobileNavigation.map(button => (
          <SidebarNavigationButton
            key={button.titleKey}
            button={button}
            isActive={isSidebarButtonActive(button, location.pathname)}
            title={t(button.titleKey)}
          />
        ))}
        <AdminNavigation adminNavigation={adminNavigation} />
      </List>
    </Box>
  );
};

export default MobileSidebarButtons;
