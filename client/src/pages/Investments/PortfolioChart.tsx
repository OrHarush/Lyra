import type { HistoryRangeValue } from '@lyra/shared';
import AddIcon from '@mui/icons-material/Add';
import { Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { useIsSmallScreen } from '@/hooks/common/useIsSmallScreen';
import { useInvestmentHistory } from '@/hooks/entities/useInvestments';
import ChartLegend from '@/pages/Investments/ChartLegend';
import { CHART_HEIGHT } from '@/pages/Investments/chartModel';
import FundFilterDropdown from '@/pages/Investments/FundFilterDropdown';
import PortfolioChartBody from '@/pages/Investments/PortfolioChartBody';
import PortfolioChartSkeleton from '@/pages/Investments/PortfolioChartSkeleton';
import RangeChips from '@/pages/Investments/RangeChips';
import type { FundColor } from '@/theme/investmentColors';
import type { InvestmentFundDto, InvestmentPurchaseViewDto } from '@/types/Investment';
import { formatMonthYearLong } from '@/utils/investmentFormat';

interface PortfolioChartProps {
  funds: InvestmentFundDto[];
  purchaseViews: InvestmentPurchaseViewDto[];
  colors: Map<string, FundColor>;
  range: HistoryRangeValue;
  onRangeChange: (range: HistoryRangeValue) => void;
  selectedSymbols: string[];
  isAllSelected: boolean;
  symbolsForQuery: string[];
  onSelectAll: () => void;
  onToggleFund: (symbol: string) => void;
  onAddPurchase: () => void;
}

const PortfolioChart = ({
  funds,
  purchaseViews,
  colors,
  range,
  onRangeChange,
  selectedSymbols,
  isAllSelected,
  symbolsForQuery,
  onSelectAll,
  onToggleFund,
  onAddPurchase,
}: PortfolioChartProps) => {
  const { t, i18n } = useTranslation('investments');
  const isSmallScreen = useIsSmallScreen();
  const { history, isLoading, isError, refetch } = useInvestmentHistory(range, symbolsForQuery);
  const height = isSmallScreen ? CHART_HEIGHT.mobile : CHART_HEIGHT.desktop;
  const startDate = history?.series[0]?.date;
  const visibleFunds = funds.filter(fund => selectedSymbols.includes(fund.yahooSymbol));

  const renderBody = () => {
    if (isLoading) {
      return <PortfolioChartSkeleton height={height} />;
    }

    if (isError || !history) {
      return (
        <Column alignItems="center" justifyContent="center" spacing={1.5} sx={{ height }}>
          <Typography color="text.secondary">{t('chart.error')}</Typography>
          <Button size="small" variant="outlined" onClick={() => refetch()}>
            {t('chart.retry')}
          </Button>
        </Column>
      );
    }

    if (history.series.length === 0) {
      return (
        <Column alignItems="center" justifyContent="center" sx={{ height }}>
          <Typography color="text.secondary">
            {t(history.purchases.length > 0 ? 'chart.waitingForTradingDay' : 'chart.noData')}
          </Typography>
        </Column>
      );
    }

    return (
      <PortfolioChartBody
        history={history}
        purchaseViews={purchaseViews}
        colors={colors}
        height={height}
      />
    );
  };

  return (
    <Column spacing={2}>
      <Row justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
        <Column spacing={0.25}>
          <Typography sx={{ fontSize: '1.125rem', fontWeight: 700 }}>{t('chart.title')}</Typography>
          {startDate && (
            <Typography color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
              {t('chart.subtitle', { from: formatMonthYearLong(startDate, i18n.language) })}
            </Typography>
          )}
        </Column>
        <Row spacing={1.5} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
          <RangeChips range={range} onChange={onRangeChange} />
          <FundFilterDropdown
            funds={funds}
            colors={colors}
            selectedSymbols={selectedSymbols}
            isAllSelected={isAllSelected}
            onSelectAll={onSelectAll}
            onToggleFund={onToggleFund}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={onAddPurchase}>
            {t('header.addPurchase')}
          </Button>
        </Row>
      </Row>
      <Row
        spacing={1.5}
        alignItems="center"
        justifyContent="space-between"
        sx={{ display: { xs: 'flex', md: 'none' } }}
      >
        <RangeChips range={range} onChange={onRangeChange} />
        <FundFilterDropdown
            funds={funds}
            colors={colors}
            selectedSymbols={selectedSymbols}
            isAllSelected={isAllSelected}
            onSelectAll={onSelectAll}
            onToggleFund={onToggleFund}
          />
      </Row>
      {renderBody()}
      {visibleFunds.length > 1 && <ChartLegend funds={visibleFunds} colors={colors} />}
    </Column>
  );
};

export default PortfolioChart;
