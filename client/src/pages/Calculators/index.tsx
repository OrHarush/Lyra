import { Tab, Tabs } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import Column from '@/components/shared/layout/containers/Column';
import ScrollableColumn from '@/components/shared/layout/containers/ScrollableColumn';
import PageLayout from '@/components/shared/layout/page/PageLayout';
import { usePageHeader } from '@/components/shared/layout/PageHeaderContext';
import { ROUTES } from '@/constants/Routes';
import { useIsSmallScreen } from '@/hooks/common/useIsSmallScreen';
import OutdatedRatesNotice from '@/pages/Calculators/components/OutdatedRatesNotice';
import CompoundInterestCalculator from '@/pages/Calculators/CompoundInterest';
import NetSalaryCalculator from '@/pages/Calculators/NetSalary';
import { getCalculatorContentStyle } from '@/pages/Calculators/styles';

const CALCULATOR_TABS = [
  { key: 'net-salary', labelKey: 'tabs.netSalary', route: ROUTES.TOOLS_NET_SALARY_URL },
  {
    key: 'compound-interest',
    labelKey: 'tabs.compoundInterest',
    route: ROUTES.TOOLS_COMPOUND_INTEREST_URL,
  },
] as const;

type CalculatorTab = (typeof CALCULATOR_TABS)[number]['key'];

const findTabByPath = (pathname: string): CalculatorTab =>
  CALCULATOR_TABS.find(tab => tab.route === pathname)?.key ?? 'net-salary';

const Calculators = () => {
  const { t } = useTranslation('calculators');
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isSmallScreen = useIsSmallScreen();

  usePageHeader(t('page.title'));

  const activeTab = findTabByPath(pathname);

  const selectTab = (tab: CalculatorTab) => {
    const target = CALCULATOR_TABS.find(item => item.key === tab);

    navigate(target?.route ?? ROUTES.TOOLS_NET_SALARY_URL, { replace: true });
  };

  return (
    <PageLayout hasNaturalHeight={isSmallScreen}>
      <Tabs
        value={activeTab}
        onChange={(_, tab: CalculatorTab) => selectTab(tab)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
      >
        {CALCULATOR_TABS.map(tab => (
          <Tab key={tab.key} value={tab.key} label={t(tab.labelKey)} />
        ))}
      </Tabs>
      {activeTab === 'net-salary' && <OutdatedRatesNotice />}
      {activeTab === 'compound-interest' && (
        <ScrollableColumn sx={getCalculatorContentStyle()}>
          <CompoundInterestCalculator />
        </ScrollableColumn>
      )}
      {activeTab === 'net-salary' && (
        <Column sx={getCalculatorContentStyle()}>
          <NetSalaryCalculator />
        </Column>
      )}
    </PageLayout>
  );
};

export default Calculators;
