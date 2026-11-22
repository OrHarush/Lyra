import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { usePurchaseTrends } from '@/hooks/entities/useInvestments';
import PurchaseCard from '@/pages/Investments/PurchaseCard';
import { buildPurchaseRows } from '@/pages/Investments/purchaseRows';
import { getPurchaseStripStyle } from '@/pages/Investments/styles';
import { FundColor, OTHER_FUND_COLOR } from '@/theme/investmentColors';
import type { InvestmentPurchaseViewDto } from '@/types/Investment';

interface PurchasesSectionProps {
  purchases: InvestmentPurchaseViewDto[];
  colors: Map<string, FundColor>;
  selectedSymbols: string[];
  onEdit?: (id: string) => void;
}

const PurchasesSection = ({ purchases, colors, selectedSymbols, onEdit }: PurchasesSectionProps) => {
  const { t } = useTranslation('investments');
  const { trends } = usePurchaseTrends();
  const rows = buildPurchaseRows(purchases, selectedSymbols);

  return (
    <Column spacing={1.5}>
      <Column spacing={0.25}>
        <Typography sx={{ fontSize: '1.125rem', fontWeight: 700 }}>{t('purchases.title')}</Typography>
        <Typography color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
          {t('purchases.hint')}
        </Typography>
      </Column>
      <Row spacing={1.5} sx={getPurchaseStripStyle()}>
        {rows.map(row => (
          <PurchaseCard
            key={row.id}
            purchase={row}
            color={colors.get(row.yahooSymbol) ?? OTHER_FUND_COLOR}
            trend={trends[row.id] ?? []}
            onEdit={onEdit}
          />
        ))}
      </Row>
    </Column>
  );
};

export default PurchasesSection;
