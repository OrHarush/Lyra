import { Button, DialogActions, DialogContent, Link, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import LyraDialog, { BaseDialogProps } from '@/components/dialogs/LyraDialog';
import Column from '@/components/shared/layout/containers/Column';
import { useCancelFixedExpense } from '@/hooks/entities/useFixedExpenses';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { FixedExpenseDto } from '@/types/FixedExpense';

interface CancelFixedExpenseDialogProps extends BaseDialogProps {
  item: FixedExpenseDto;
  onAddLink: () => void;
}

const CancelFixedExpenseDialog = ({
  isOpen,
  closeDialog,
  item,
  onAddLink,
}: CancelFixedExpenseDialogProps) => {
  const { t } = useTranslation('fixedExpenses');
  const { alertSuccess, alertError } = useSnackbar();
  const cancelFixedExpense = useCancelFixedExpense();

  const confirmCancelled = async () => {
    try {
      await cancelFixedExpense.mutateAsync({ id: item._id });
      alertSuccess(t('toast.cancelled', { name: item.name }));
      closeDialog();
    } catch {
      alertError(t('errors.cancelFailed'));
    }
  };

  return (
    <LyraDialog
      isOpen={isOpen}
      closeDialog={closeDialog}
      title={t('cancel.title', { name: item.name })}
      forceDialog
    >
      <DialogContent sx={{ pt: 1 }}>
        <Column spacing={1.5} alignItems="flex-start">
          <Typography>{t(item.cancelUrl ? 'cancel.bodyWithLink' : 'cancel.bodyWithoutLink')}</Typography>
          {!item.cancelUrl && (
            <Link component="button" type="button" onClick={onAddLink}>
              {t('cancel.addLink')}
            </Link>
          )}
        </Column>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} variant="outlined">
          {t('cancel.notYet')}
        </Button>
        <Button
          onClick={confirmCancelled}
          variant="contained"
          color="error"
          disabled={cancelFixedExpense.isPending}
        >
          {t('cancel.confirm')}
        </Button>
      </DialogActions>
    </LyraDialog>
  );
};

export default CancelFixedExpenseDialog;
