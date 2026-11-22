import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface TransactionActionsProps {
  openCreateDialog?: () => void;
}

const TransactionActions = ({ openCreateDialog }: TransactionActionsProps) => {
  const { t } = useTranslation('transactions');

  return (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={openCreateDialog}
      sx={{ whiteSpace: 'nowrap', flexShrink: 0, height: 40, borderRadius: '999px', px: 2.5 }}
    >
      {t('actions.create')}
    </Button>
  );
};

export default TransactionActions;
