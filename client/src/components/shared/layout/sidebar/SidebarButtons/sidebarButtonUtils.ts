import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BugReportIcon from '@mui/icons-material/BugReport';
import CalculateIcon from '@mui/icons-material/Calculate';
import CategoryIcon from '@mui/icons-material/Category';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import SavingsIcon from '@mui/icons-material/Savings';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';

import { SidebarButtonConfig } from '@/components/shared/layout/sidebar/SidebarButtons/SidebarNavigationButton';
import { ROUTES } from '@/constants/Routes';

export const isSidebarButtonActive = (button: SidebarButtonConfig, pathname: string) =>
  button.activePathPrefix
    ? pathname === button.activePathPrefix || pathname.startsWith(`${button.activePathPrefix}/`)
    : pathname === button.route;

export const primaryNavigation: SidebarButtonConfig[] = [
  { titleKey: 'overview', icon: DashboardIcon, route: ROUTES.OVERVIEW_URL },
  { titleKey: 'transactions', icon: RequestQuoteIcon, route: ROUTES.TRANSACTIONS_URL },
];

export const fixedExpensesButton: SidebarButtonConfig = {
  titleKey: 'fixedExpenses',
  icon: EventRepeatIcon,
  route: ROUTES.FIXED_EXPENSES_URL,
};

export const budgetButton: SidebarButtonConfig = {
  titleKey: 'budgets',
  icon: SavingsIcon,
  route: ROUTES.BUDGETS_URL,
};

export const goalsButton: SidebarButtonConfig = {
  titleKey: 'goals',
  icon: TrackChangesIcon,
  route: ROUTES.GOALS_URL,
};

export const investmentsButton: SidebarButtonConfig = {
  titleKey: 'investments',
  icon: ShowChartIcon,
  route: ROUTES.INVESTMENTS_URL,
};

export const calculatorsButton: SidebarButtonConfig = {
  titleKey: 'calculators',
  icon: CalculateIcon,
  route: ROUTES.TOOLS_NET_SALARY_URL,
  activePathPrefix: ROUTES.TOOLS_URL,
};

export const manageNavigation: SidebarButtonConfig[] = [
  { titleKey: 'accounts', icon: AccountBalanceWalletIcon, route: ROUTES.ACCOUNTS_URL },
  { titleKey: 'categories', icon: CategoryIcon, route: ROUTES.CATEGORIES_URL },
  { titleKey: 'paymentMethods', icon: CreditCardIcon, route: ROUTES.PAYMENT_METHODS_URL },
];

export const buildAdminNavigationButtons = (isAdminUser: boolean): SidebarButtonConfig[] => {
  if (!isAdminUser) {
    return [];
  }

  return [
    {
      titleKey: 'chat',
      icon: SmartToyIcon,
      route: ROUTES.CHAT_URL,
      badge: 'NEW',
    },
    {
      titleKey: 'admin',
      icon: AdminPanelSettingsIcon,
      route: ROUTES.ADMIN_KPIS_URL,
    },
    {
      titleKey: 'adminDebug',
      icon: BugReportIcon,
      route: ROUTES.ADMIN_DEBUG_URL,
    },
  ];
};
