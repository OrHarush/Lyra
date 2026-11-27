import { SvgIconComponent } from '@mui/icons-material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

import {
  adminToolButtons,
  budgetButton,
  calculatorsButton,
  chatButton,
  fixedExpensesButton,
  goalsButton,
  investmentsButton,
  manageNavigation,
  primaryNavigation,
} from '@/components/shared/layout/sidebar/SidebarButtons/sidebarButtonUtils';
import { SidebarButtonConfig } from '@/components/shared/layout/sidebar/SidebarButtons/SidebarNavigationButton';

export interface DesktopNavSection {
  id: 'daily' | 'plan' | 'growth' | 'manage' | 'assistant' | 'admin';
  titleKey?: string;
  // Present only on collapsible sections, which render the title as a toggle row.
  toggleIcon?: SvgIconComponent;
  items: SidebarButtonConfig[];
}

export const buildDesktopNavSections = (isAdminUser: boolean): DesktopNavSection[] => {
  const sections: DesktopNavSection[] = [
    { id: 'daily', items: [...primaryNavigation, fixedExpensesButton] },
    { id: 'plan', titleKey: 'plan', items: [budgetButton, goalsButton] },
    { id: 'growth', titleKey: 'growth', items: [investmentsButton, calculatorsButton] },
    { id: 'manage', titleKey: 'manage', toggleIcon: ManageAccountsIcon, items: manageNavigation },
    { id: 'assistant', items: isAdminUser ? [chatButton] : [] },
    {
      id: 'admin',
      titleKey: 'admin',
      toggleIcon: AdminPanelSettingsIcon,
      items: isAdminUser ? adminToolButtons : [],
    },
  ];

  return sections.filter(section => section.items.length > 0);
};
