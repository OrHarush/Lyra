import { Analytics } from '@vercel/analytics/react';
import { Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import LoadingScreen from '@/components/shared/feedback/LoadingScreen';
import AuthenticatedLayout from '@/components/shared/layout/AuthenticatedLayout';
import Column from '@/components/shared/layout/containers/Column';
import PublicLayout from '@/components/shared/layout/PublicLayout';
import { ROUTES } from '@/constants/Routes';
import { useMinLoadingDuration } from '@/hooks/common/useMinLoadingDuration';
import Accounts from '@/pages/Accounts';
import { AdminDashboard } from '@/pages/Admin';
import AdminDebugPage from '@/pages/Admin/Debug';
import BlogIndex from '@/pages/Blog';
import CashflowGuide from '@/pages/Blog/CashflowGuide';
import CouplesMoney from '@/pages/Blog/CouplesMoney';
import CreditCardBillingCycle from '@/pages/Blog/CreditCardBillingCycle';
import FreeExpenseApps from '@/pages/Blog/FreeExpenseApps';
import RiseUpReview from '@/pages/Blog/RiseUpReview';
import Budgets from '@/pages/Budgets';
import Calculators from '@/pages/Calculators';
import Categories from '@/pages/Categories';
import CategoryTrends from '@/pages/CategoryTrends';
import Chat from '@/pages/Chat';
import Goals from '@/pages/Goals';
import GoalDetail from '@/pages/Goals/GoalDetail';
import HomePage from '@/pages/Home';
import ImportWizardPage from '@/pages/Import/ImportWizardPage';
import Investments from '@/pages/Investments';
import InvitationLandingPage from '@/pages/Invitation/InvitationLandingPage';
import LegalPage from '@/pages/LegalPage/LegalPage';
import LoginPage from '@/pages/Login';
import NotFoundPage from '@/pages/NotFoundPage';
import Overview from '@/pages/Overview';
import PaymentMethods from '@/pages/PaymentMethods';
import CalculatorsHubRoute from '@/pages/PublicCalculators/CalculatorsHubRoute';
import CompoundInterestPublicPage from '@/pages/PublicCalculators/CompoundInterestPublicPage';
import NetSalaryPublicPage from '@/pages/PublicCalculators/NetSalaryPublicPage';
import PublicCalculatorRoute from '@/pages/PublicCalculators/PublicCalculatorRoute';
import ShortcutAuthPage from '@/pages/ShortcutAuth';
import { Transactions } from '@/pages/Transactions';
import TransactionsReview from '@/pages/Transactions/Review';
import { useAuth } from '@/providers/AuthProvider';
import { RequireAdmin, RequireAuth, RequireGuest } from '@/routes/guards/ProtectedRoute';

const BASELINE_EXCLUDED_EMAILS = ['lyra.il.app@gmail.com'];

const ANALYTICS_EXCLUDED_EMAILS = new Set(
  [
    ...BASELINE_EXCLUDED_EMAILS,
    ...(import.meta.env.VITE_EXCLUDE_EMAILS ?? '').split(','),
  ]
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean),
);

const isExcludedEmail = (email: string | undefined) =>
  !!email && ANALYTICS_EXCLUDED_EMAILS.has(email.toLowerCase());

const AppRoutes = () => {
  const { user, isLoadingUser } = useAuth();

  const hasStoredToken =
    !!localStorage.getItem('token') || import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';
  const showLoading = useMinLoadingDuration(isLoadingUser, 1500, hasStoredToken);

  const trackAnalytics =
    !isExcludedEmail(user?.email) && user?.analyticsConsent === 'accepted';

  if (showLoading) {
    return (
      <Column height={'100vh'}>
        <LoadingScreen />
      </Column>
    );
  }

  return (
    <BrowserRouter>
      {trackAnalytics && <Analytics />}
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route
              path={ROUTES.TERMS_OF_SERVICE_URL}
              element={<LegalPage type="termsOfService" />}
            />
            <Route path={ROUTES.PRIVACY_POLICY_URL} element={<LegalPage type="privacyPolicy" />} />
            <Route path={ROUTES.ACCESSIBILITY_URL} element={<LegalPage type="accessibility" />} />
            <Route path={ROUTES.BLOG_URL} element={<BlogIndex />} />
            <Route path={ROUTES.BLOG_RISEUP_REVIEW_URL} element={<RiseUpReview />} />
            <Route path={ROUTES.BLOG_CASHFLOW_GUIDE_URL} element={<CashflowGuide />} />
            <Route path={ROUTES.BLOG_FREE_EXPENSE_APPS_URL} element={<FreeExpenseApps />} />
            <Route path={ROUTES.BLOG_CREDIT_CARD_BILLING_CYCLE_URL} element={<CreditCardBillingCycle />} />
            <Route path={ROUTES.BLOG_COUPLES_MONEY_URL} element={<CouplesMoney />} />
            <Route path={ROUTES.CALCULATORS_URL} element={<CalculatorsHubRoute />} />
            <Route
              path={ROUTES.CALCULATORS_NET_SALARY_URL}
              element={
                <PublicCalculatorRoute toolsRoute={ROUTES.TOOLS_NET_SALARY_URL}>
                  <NetSalaryPublicPage />
                </PublicCalculatorRoute>
              }
            />
            <Route
              path={ROUTES.CALCULATORS_COMPOUND_INTEREST_URL}
              element={
                <PublicCalculatorRoute toolsRoute={ROUTES.TOOLS_COMPOUND_INTEREST_URL}>
                  <CompoundInterestPublicPage />
                </PublicCalculatorRoute>
              }
            />
            <Route path={ROUTES.INVITATION_URL} element={<InvitationLandingPage />} />
            <Route path={ROUTES.SHORTCUT_AUTH_URL} element={<ShortcutAuthPage />} />
          </Route>
          <Route
            element={
              <RequireGuest>
                <PublicLayout />
              </RequireGuest>
            }
          >
            <Route path={ROUTES.HOME_URL} element={<HomePage />} />
            <Route path={ROUTES.LOGIN_URL} element={<LoginPage />} />
            <Route path="*" element={<NotFoundPage isAuthenticated={!!user} />} />
          </Route>
          <Route
            element={
              <RequireAuth>
                <AuthenticatedLayout />
              </RequireAuth>
            }
          >
            <Route path={ROUTES.OVERVIEW_URL} element={<Overview />} />
            <Route path={ROUTES.TRANSACTIONS_URL} element={<Transactions />} />
            <Route path={ROUTES.CATEGORY_TRENDS_URL} element={<CategoryTrends />} />
            <Route path={ROUTES.TRANSACTIONS_REVIEW_URL} element={<TransactionsReview />} />
            <Route path={ROUTES.IMPORT_URL} element={<ImportWizardPage />} />
            <Route path={ROUTES.ACCOUNTS_URL} element={<Accounts />} />
            <Route path={ROUTES.CATEGORIES_URL} element={<Categories />} />
            <Route path={ROUTES.PAYMENT_METHODS_URL} element={<PaymentMethods />} />
            <Route
              path={ROUTES.ADMIN_KPIS_URL}
              element={
                <RequireAdmin>
                  <AdminDashboard />
                </RequireAdmin>
              }
            />
            <Route
              path={ROUTES.ADMIN_DEBUG_URL}
              element={
                <RequireAdmin>
                  <AdminDebugPage />
                </RequireAdmin>
              }
            />
            <Route path={ROUTES.BUDGETS_URL} element={<Budgets />} />
            <Route path={ROUTES.GOALS_URL} element={<Goals />} />
            <Route path={ROUTES.GOAL_DETAIL_URL} element={<GoalDetail />} />
            <Route path={ROUTES.INVESTMENTS_URL} element={<Investments />} />
            <Route path={ROUTES.TOOLS_URL} element={<Navigate to={ROUTES.TOOLS_NET_SALARY_URL} replace />} />
            <Route path={ROUTES.TOOLS_NET_SALARY_URL} element={<Calculators />} />
            <Route path={ROUTES.TOOLS_COMPOUND_INTEREST_URL} element={<Calculators />} />
            <Route
              path={ROUTES.CHAT_URL}
              element={
                <RequireAdmin>
                  <Chat />
                </RequireAdmin>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
