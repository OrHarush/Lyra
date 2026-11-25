import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Row from '@/components/shared/layout/containers/Row';
import ViewAllLink from '@/components/shared/ui/ViewAllLink';
import { ROUTES } from '@/constants/Routes';

interface RecentTransactionsHeaderProps {
  hasSeeAll: boolean;
}

const RecentTransactionsHeader = ({ hasSeeAll }: RecentTransactionsHeaderProps) => {
  const { t } = useTranslation('overview');

  return (
    <Row justifyContent="space-between" alignItems="center" spacing={1}>
      <Typography variant="h5" color="text.primary" noWrap>
        {t('recentTransactions.title')}
      </Typography>
      {hasSeeAll && (
        <ViewAllLink to={ROUTES.TRANSACTIONS_URL} label={t('recentTransactions.seeAll')} />
      )}
    </Row>
  );
};

export default RecentTransactionsHeader;
