import { Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

import Row from '@/components/shared/layout/containers/Row';
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
        <Button component={RouterLink} to={ROUTES.TRANSACTIONS_URL} size="small">
          {t('recentTransactions.seeAll')}
        </Button>
      )}
    </Row>
  );
};

export default RecentTransactionsHeader;
