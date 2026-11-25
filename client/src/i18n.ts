import 'dayjs/locale/he';
import 'dayjs/locale/en';

import dayjs from 'dayjs';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enAccessibility from '@/locales/en/accessibility.json';
import enAccounts from '@/locales/en/accounts.json';
import enAdmin from '@/locales/en/admin.json';
import enBlog from '@/locales/en/blog.json';
import enBlogCouplesMoney from '@/locales/en/blogCouplesMoney.json';
import enBlogCreditCardBillingCycle from '@/locales/en/blogCreditCardBillingCycle.json';
import enBlogFreeExpenseApps from '@/locales/en/blogFreeExpenseApps.json';
import enBudgets from '@/locales/en/budgets.json';
import enCalculators from '@/locales/en/calculators.json';
import enCashflowGuide from '@/locales/en/cashflowGuide.json';
import enCategories from '@/locales/en/categories.json';
import enCategoryTrends from '@/locales/en/categoryTrends.json';
import enChat from '@/locales/en/chat.json';
import enCommon from '@/locales/en/common.json';
import enGoals from '@/locales/en/goals.json';
import enHome from '@/locales/en/home.json';
import enInvestments from '@/locales/en/investments.json';
import enLogin from '@/locales/en/login.json';
import enMcp from '@/locales/en/mcp.json';
import enOverview from '@/locales/en/overview.json';
import enPaymentMethods from '@/locales/en/paymentMethods.json';
import enPrivacyPolicy from '@/locales/en/privacyPolicy.json';
import enPublicCalculators from '@/locales/en/publicCalculators.json';
import enRiseupReview from '@/locales/en/riseupReview.json';
import enSidebar from '@/locales/en/sidebar.json';
import enTermsOfService from '@/locales/en/termsOfService.json';
import enTransactions from '@/locales/en/transactions.json';
import enUser from '@/locales/en/user.json';
import heAccessibility from '@/locales/he/accessibility.json';
import heAccounts from '@/locales/he/accounts.json';
import heAdmin from '@/locales/he/admin.json';
import heBlog from '@/locales/he/blog.json';
import heBlogCouplesMoney from '@/locales/he/blogCouplesMoney.json';
import heBlogCreditCardBillingCycle from '@/locales/he/blogCreditCardBillingCycle.json';
import heBlogFreeExpenseApps from '@/locales/he/blogFreeExpenseApps.json';
import heBudgets from '@/locales/he/budgets.json';
import heCalculators from '@/locales/he/calculators.json';
import heCashflowGuide from '@/locales/he/cashflowGuide.json';
import heCategories from '@/locales/he/categories.json';
import heCategoryTrends from '@/locales/he/categoryTrends.json';
import heChat from '@/locales/he/chat.json';
import heCommon from '@/locales/he/common.json';
import heGoals from '@/locales/he/goals.json';
import heHome from '@/locales/he/home.json';
import heInvestments from '@/locales/he/investments.json';
import heLogin from '@/locales/he/login.json';
import heMcp from '@/locales/he/mcp.json';
import heOverview from '@/locales/he/overview.json';
import hePaymentMethods from '@/locales/he/paymentMethods.json';
import hePrivacyPolicy from '@/locales/he/privacyPolicy.json';
import hePublicCalculators from '@/locales/he/publicCalculators.json';
import heRiseupReview from '@/locales/he/riseupReview.json';
import heSidebar from '@/locales/he/sidebar.json';
import heTermsOfService from '@/locales/he/termsOfService.json';
import heTransactions from '@/locales/he/transactions.json';
import heUser from '@/locales/he/user.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        admin: enAdmin,
        accessibility: enAccessibility,
        common: enCommon,
        home: enHome,
        login: enLogin,
        user: enUser,
        privacyPolicy: enPrivacyPolicy,
        blog: enBlog,
        blogFreeExpenseApps: enBlogFreeExpenseApps,
        blogCreditCardBillingCycle: enBlogCreditCardBillingCycle,
        blogCouplesMoney: enBlogCouplesMoney,
        cashflowGuide: enCashflowGuide,
        riseupReview: enRiseupReview,
        termsOfService: enTermsOfService,
        sidebar: enSidebar,
        overview: enOverview,
        transactions: enTransactions,
        accounts: enAccounts,
        categories: enCategories,
        categoryTrends: enCategoryTrends,
        paymentMethods: enPaymentMethods,
        budgets: enBudgets,
        chat: enChat,
        goals: enGoals,
        calculators: enCalculators,
        publicCalculators: enPublicCalculators,
        investments: enInvestments,
        mcp: enMcp,
      },
      he: {
        admin: heAdmin,
        accessibility: heAccessibility,
        common: heCommon,
        home: heHome,
        login: heLogin,
        user: heUser,
        privacyPolicy: hePrivacyPolicy,
        blog: heBlog,
        blogFreeExpenseApps: heBlogFreeExpenseApps,
        blogCreditCardBillingCycle: heBlogCreditCardBillingCycle,
        blogCouplesMoney: heBlogCouplesMoney,
        cashflowGuide: heCashflowGuide,
        riseupReview: heRiseupReview,
        termsOfService: heTermsOfService,
        sidebar: heSidebar,
        overview: heOverview,
        transactions: heTransactions,
        accounts: heAccounts,
        categories: heCategories,
        categoryTrends: heCategoryTrends,
        paymentMethods: hePaymentMethods,
        budgets: heBudgets,
        chat: heChat,
        goals: heGoals,
        calculators: heCalculators,
        publicCalculators: hePublicCalculators,
        investments: heInvestments,
        mcp: heMcp,
      },
    },
    fallbackLng: 'he',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
    },
  });

dayjs.locale(i18n.language);

i18n.on('languageChanged', lng => {
  dayjs.locale(lng);
});

export default i18n;
