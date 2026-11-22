import type { NetSalaryBreakdown, NetSalaryInput } from '@lyra/shared';
import { useTranslation } from 'react-i18next';

import ScrollableColumn from '@/components/shared/layout/containers/ScrollableColumn';
import BreakdownCard from '@/pages/Calculators/NetSalary/BreakdownCard';
import { buildNetSalarySummaryText } from '@/pages/Calculators/NetSalary/buildNetSalarySummaryText';
import NetSummaryCard from '@/pages/Calculators/NetSalary/NetSummaryCard';
import { getNetSalaryResultsStyle } from '@/pages/Calculators/styles';

interface NetSalaryResultsProps {
  breakdown: NetSalaryBreakdown;
  input: NetSalaryInput;
}

const NetSalaryResults = ({ breakdown, input }: NetSalaryResultsProps) => {
  const { t } = useTranslation('calculators');

  const getSummaryText = () => buildNetSalarySummaryText({ breakdown, input, t });

  return (
    <ScrollableColumn sx={getNetSalaryResultsStyle()}>
      <NetSummaryCard breakdown={breakdown} getSummaryText={getSummaryText} />
      <BreakdownCard breakdown={breakdown} />
    </ScrollableColumn>
  );
};

export default NetSalaryResults;
