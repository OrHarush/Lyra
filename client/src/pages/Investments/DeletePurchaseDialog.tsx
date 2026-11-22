import { Button, DialogActions, DialogContent, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import LyraDialog, { BaseDialogProps } from '@/components/dialogs/LyraDialog';
import { useDeleteInvestmentPurchase } from '@/hooks/entities/useInvestmentMutations';
import { useSnackbar } from '@/providers/SnackbarProvider';

interface DeletePurchaseDialogProps extends BaseDialogProps {
  purchaseId: string;
  onDeleted: () => void;
}

const DeletePurchaseDialog = ({
  isOpen,
  closeDialog,
  purchaseId,
  onDeleted,
}: DeletePurchaseDialogProps) => {
  const { t } = useTranslation('investments');
  const { t: tCommon } = useTranslation('common');
  const { alertSuccess, alertError } = useSnackbar();
  const deletePurchase = useDeleteInvestmentPurchase();

  const confirmDelete = async () => {
    try {
      await deletePurchase.mutateAsync(purchaseId);
      alertSuccess(t('toast.deleted'));
      onDeleted();
    } catch {
      alertError(t('errors.deleteFailed'));
    }
  };

  return (
    <LyraDialog isOpen={isOpen} closeDialog={closeDialog} title={t('delete.title')} forceDialog>
      <DialogContent sx={{ pt: 1 }}>
        <Typography>{t('delete.body')}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} variant="outlined">
          {tCommon('buttons.cancel')}
        </Button>
        <Button
          onClick={confirmDelete}
          variant="contained"
          color="error"
          disabled={deletePurchase.isPending}
        >
          {tCommon('buttons.delete')}
        </Button>
      </DialogActions>
    </LyraDialog>
  );
};

export default DeletePurchaseDialog;
