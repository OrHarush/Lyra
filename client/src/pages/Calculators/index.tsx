import { Tab, Tabs } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import Column from '@/components/shared/layout/containers/Column';
import ScrollableColumn from '@/components/shared/layout/containers/ScrollableColumn';
import PageLayout from '@/components/shared/layout/page/PageLayout';
import { usePageHeader } from '@/components/shared/layout/PageHeaderContext';
import { useIsSmallScreen } from '@/hooks/common/useIsSmallScreen';
import CompoundInterestCalculator from '@/pages/Calculators/CompoundInterest';
import NetSalaryCalculator from '@/pages/Calculators/NetSalary';
import { getCalculatorContentStyle } from '@/pages/Calculators/styles';

const CALCULATOR_TABS = [
  { key: 'net-salary', labelKey: 'tabs.netSalary' },
  { key: 'compound-interest', labelKey: 'tabs.compoundInterest' },
] as const;

type CalculatorTab = (typeof CALCULATOR_TABS)[number]['key'];

const TAB_PARAM = 'tab';

const isCalculatorTab = (value: string | null): value is CalculatorTab =>
  CALCULATOR_TABS.some(tab => tab.key === value);

const Calculators = () => {
  const { t } = useTranslation('calculators');
  const [searchParams, setSearchParams] = useSearchParams();

  const isSmallScreen = useIsSmallScreen();

  usePageHeader(t('page.title'));

  const tabParam = searchParams.get(TAB_PARAM);
  const activeTab: CalculatorTab = isCalculatorTab(tabParam) ? tabParam : 'net-salary';

  const selectTab = (tab: CalculatorTab) => {
    setSearchParams({ [TAB_PARAM]: tab }, { replace: true });
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
