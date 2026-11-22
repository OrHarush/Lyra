import { Button, DialogActions, DialogContent } from '@mui/material';
import { useTranslation } from 'react-i18next';

import LyraDialog, { BaseDialogProps } from '@/components/dialogs/LyraDialog';
import TransactionsFilters from '@/pages/Transactions/TransactionsFilters';

const TransactionsFiltersSheet = ({ isOpen, closeDialog }: BaseDialogProps) => {
  const { t } = useTranslation('transactions');

  return (
    <LyraDialog isOpen={isOpen} closeDialog={closeDialog} title={t('filters.sheetTitle')}>
      <DialogContent sx={{ px: 0 }}>
        <TransactionsFilters />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={closeDialog}>
          {t('filters.done')}
        </Button>
      </DialogActions>
    </LyraDialog>
  );
};

export default TransactionsFiltersSheet;
