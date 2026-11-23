import { Box, List } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import AdminNavigation from '@/components/shared/layout/sidebar/SidebarButtons/AdminNavigation';
import ManagementButtonsNavigation from '@/components/shared/layout/sidebar/SidebarButtons/ManagementButtonsNavigation';
import {
  budgetButton,
  buildAdminNavigationButtons,
  calculatorsButton,
  goalsButton,
  investmentsButton,
  isSidebarButtonActive,
  manageNavigation,
  primaryNavigation,
} from '@/components/shared/layout/sidebar/SidebarButtons/sidebarButtonUtils';
import SidebarNavigationButton from '@/components/shared/layout/sidebar/SidebarButtons/SidebarNavigationButton';
import { SidebarButtonsStyles } from '@/components/shared/layout/sidebar/SidebarButtons/styles';
import { useSidebar } from '@/components/shared/layout/sidebar/SidebarContext';
import { ROUTES } from '@/constants/Routes';
import { useReviewCount } from '@/hooks/entities/useTransactionReview';
import { useAuth } from '@/providers/AuthProvider';
import { isAdmin } from '@/utils/env';

const DesktopSidebarButtons = () => {
  const { t } = useTranslation('sidebar');
  const location = useLocation();
  const { user } = useAuth();
  const { expanded } = useSidebar();
  const standaloneNavigation = [
    budgetButton,
    goalsButton,
    investmentsButton,
    calculatorsButton,
  ];
  const [isManageExpanded, setIsManageExpanded] = useState(false);
  const { data: reviewCountData } = useReviewCount(!!user);

  const reviewCount = reviewCountData?.count ?? 0;

  const primaryNavWithBadge = primaryNavigation.map(button =>
    button.route === ROUTES.TRANSACTIONS_URL && reviewCount > 0
      ? { ...button, badge: String(reviewCount) }
      : button
  );

  const adminNavigation = buildAdminNavigationButtons(isAdmin(user));

  const showManageItems = isManageExpanded || !expanded;

  const routeRows = [
    ...primaryNavWithBadge,
    ...standaloneNavigation,
    ...(showManageItems ? manageNavigation : []),
    ...adminNavigation,
  ];

  // When expanded, the "Manage" toggle row sits between the standalone buttons and the manage
  // items, so the highlight pill must skip one extra slot for everything rendered after it.
  const manageToggleIndex = primaryNavWithBadge.length + standaloneNavigation.length;
  const activeRouteIndex = routeRows.findIndex(button => isSidebarButtonActive(button, location.pathname));
  const activeIndex =
    expanded && activeRouteIndex >= manageToggleIndex ? activeRouteIndex + 1 : activeRouteIndex;

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={SidebarButtonsStyles(activeIndex)} />
      <List sx={{ position: 'relative', zIndex: 1 }}>
        {primaryNavWithBadge.map(button => (
          <SidebarNavigationButton
            key={button.titleKey}
            button={button}
            isActive={isSidebarButtonActive(button, location.pathname)}
            title={t(button.titleKey)}
          />
        ))}
        {standaloneNavigation.map(button => (
          <SidebarNavigationButton
            key={button.titleKey}
            button={button}
            isActive={isSidebarButtonActive(button, location.pathname)}
            title={t(button.titleKey)}
          />
        ))}
        <ManagementButtonsNavigation
          manageNavigation={manageNavigation}
          isManageExpanded={isManageExpanded}
          onToggle={() => setIsManageExpanded(prev => !prev)}
        />
        <AdminNavigation adminNavigation={adminNavigation} />
      </List>
    </Box>
  );
};

export default DesktopSidebarButtons;
