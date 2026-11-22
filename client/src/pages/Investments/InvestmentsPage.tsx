import type { HistoryRangeValue } from '@lyra/shared';
import { useCallback, useMemo, useState } from 'react';

import PageLayout from '@/components/shared/layout/page/PageLayout';
import { usePrimaryAction } from '@/components/shared/layout/PageHeaderContext';
import { useInvestmentPurchases, useInvestmentSummary } from '@/hooks/entities/useInvestments';
import InvestmentsEmptyState from '@/pages/Investments/InvestmentsEmptyState';
import InvestmentsErrorCard from '@/pages/Investments/InvestmentsErrorCard';
import InvestmentsSkeleton from '@/pages/Investments/InvestmentsSkeleton';
import PortfolioChart from '@/pages/Investments/PortfolioChart';
import PortfolioOverviewCard from '@/pages/Investments/PortfolioOverviewCard';
import PortfolioWarnings from '@/pages/Investments/PortfolioWarnings';
import PurchaseDialog from '@/pages/Investments/PurchaseDialog';
import PurchasesSection from '@/pages/Investments/PurchasesSection';
import { useFundFilter } from '@/pages/Investments/useFundFilter';
import { buildFundColorMap } from '@/theme/investmentColors';

type DialogState = { mode: 'closed' } | { mode: 'add' } | { mode: 'edit'; purchaseId: string };

const InvestmentsPage = () => {
  const { summary, isLoading, isError, refetch } = useInvestmentSummary();
  const { purchases } = useInvestmentPurchases();
  const colors = useMemo(() => buildFundColorMap(summary?.purchases ?? []), [summary]);
  const [range, setRange] = useState<HistoryRangeValue>('ALL');
  const [dialog, setDialog] = useState<DialogState>({ mode: 'closed' });
  const fundFilter = useFundFilter(summary?.funds.map(fund => fund.yahooSymbol) ?? []);

  const openAddDialog = useCallback(() => setDialog({ mode: 'add' }), []);
  const openEditDialog = (purchaseId: string) => setDialog({ mode: 'edit', purchaseId });
  const closeDialog = () => setDialog({ mode: 'closed' });

  usePrimaryAction(openAddDialog);

  const editedPurchase =
    dialog.mode === 'edit' ? purchases.find(purchase => purchase.id === dialog.purchaseId) : undefined;
  const hasPurchases = Boolean(summary && summary.funds.length > 0);

  const renderContent = () => {
    if (isLoading) {
      return <InvestmentsSkeleton />;
    }

    if (isError || !summary) {
      return <InvestmentsErrorCard onRetry={() => refetch()} />;
    }

    if (!hasPurchases) {
      return <InvestmentsEmptyState onAddPurchase={openAddDialog} />;
    }

    return (
      <>
        <PortfolioWarnings summary={summary} />
        <PortfolioOverviewCard
          summary={summary}
          colors={colors}
          chart={
            <PortfolioChart
              funds={summary.funds}
              purchaseViews={summary.purchases}
              colors={colors}
              range={range}
              onRangeChange={setRange}
              selectedSymbols={fundFilter.selectedSymbols}
              isAllSelected={fundFilter.isAllSelected}
              symbolsForQuery={fundFilter.symbolsForQuery}
              onSelectAll={fundFilter.selectAll}
              onToggleFund={fundFilter.toggleFund}
              onAddPurchase={openAddDialog}
            />
          }
        />
        <PurchasesSection
          purchases={summary.purchases}
          colors={colors}
          selectedSymbols={fundFilter.selectedSymbols}
          onEdit={openEditDialog}
        />
      </>
    );
  };

  return (
    <PageLayout hasNaturalHeight spacing={2.5}>
      {renderContent()}
      {dialog.mode === 'add' && <PurchaseDialog isOpen closeDialog={closeDialog} />}
      {dialog.mode === 'edit' && editedPurchase && (
        <PurchaseDialog isOpen closeDialog={closeDialog} purchase={editedPurchase} />
      )}
    </PageLayout>
  );
};

export default InvestmentsPage;
