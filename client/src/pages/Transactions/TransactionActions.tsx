import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Row from '@/components/shared/layout/containers/Row';

interface TransactionActionsProps {
  openCreateDialog?: () => void;
}

const TransactionActions = ({ openCreateDialog }: TransactionActionsProps) => {
  const { t } = useTranslation('transactions');

  return (
    <Row spacing={1}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={openCreateDialog}
        sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
      >
        {t('actions.create')}
      </Button>
    </Row>
  );
};

export default TransactionActions;
