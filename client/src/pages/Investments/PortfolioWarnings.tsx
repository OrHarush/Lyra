import { Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import type { InvestmentSummaryDto } from '@/types/Investment';

interface PortfolioWarningsProps {
  summary: InvestmentSummaryDto;
}

const PortfolioWarnings = ({ summary }: PortfolioWarningsProps) => {
  const { t } = useTranslation('investments');
  const unpricedNames = summary.funds
    .filter(fund => fund.valueIls === null)
    .map(fund => fund.badge)
    .join(', ');

  if (!summary.hasMissingPrices && !summary.fxApproximate) {
    return null;
  }

  return (
    <Column spacing={1}>
      {summary.hasMissingPrices && (
        <Alert severity="warning" role="alert">
          {t('warnings.missingPrices', { funds: unpricedNames })}
        </Alert>
      )}
      {summary.fxApproximate && (
        <Alert severity="info">{t('warnings.fxApproximate')}</Alert>
      )}
    </Column>
  );
};

export default PortfolioWarnings;
