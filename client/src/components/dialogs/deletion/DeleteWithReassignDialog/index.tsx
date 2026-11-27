import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Button, CircularProgress, DialogActions, DialogContent } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DeleteDialogContent from '@/components/dialogs/deletion/DeleteWithReassignDialog/DeleteDialogContent';
import LyraDialog, { BaseDialogProps } from '@/components/dialogs/LyraDialog';
import Column from '@/components/shared/layout/containers/Column';
import { API_ROUTES } from '@/constants/Routes';
import { useFetch } from '@/hooks/common/useFetch';
import { TransactionDto } from '@/types/Transaction';

export interface DeleteWithReassignDialogProps extends BaseDialogProps {
  onConfirm: (replacementId: string | null) => void;
  itemName: string;
  itemType: 'account' | 'paymentMethod';
  itemId: string;
  replacementOptions: { id: string; label: string }[];
  isLoading: boolean;
}

interface TransactionPreviewResponse {
  data: TransactionDto[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

const PREVIEW_LIMIT = 5;

const DeleteWithReassignDialog = ({
  isOpen,
  closeDialog,
  onConfirm,
  itemName,
  itemType,
  itemId,
  replacementOptions,
  isLoading,
}: DeleteWithReassignDialogProps) => {
  const { t } = useTranslation(['common']);
  const [selectedReplacementId, setSelectedReplacementId] = useState('');

  const previewFilter = itemType === 'paymentMethod' ? 'paymentMethodIds' : 'accountIds';
  const previewUrl = `${API_ROUTES.TRANSACTIONS}?${previewFilter}=${itemId}&limit=${PREVIEW_LIMIT}&expandTransfers=false`;

  const { data: previewData, isLoading: isLoadingPreview } = useFetch<TransactionPreviewResponse>({
    url: previewUrl,
    queryKey: ['transactions', 'preview', itemType, itemId],
    enabled: isOpen && !!itemId,
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedReplacementId(replacementOptions.length === 1 ? replacementOptions[0].id : '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, itemId]);

  const transactions = previewData?.data ?? [];
  const total = previewData?.pagination?.total ?? 0;
  const extraCount = total - PREVIEW_LIMIT;
  const hasTransactions = total > 0;
  const showDropdown = hasTransactions && replacementOptions.length > 1;
  const showAutoMove = hasTransactions && replacementOptions.length === 1;

  const isConfirmDisabled =
    isLoading ||
    isLoadingPreview ||
    (hasTransactions && replacementOptions.length > 1 && !selectedReplacementId);

  const handleConfirm = () => {
    if (!hasTransactions) {
      onConfirm(null);

      return;
    }

    const replacement =
      replacementOptions.length === 1 ? replacementOptions[0].id : selectedReplacementId;

    onConfirm(replacement || null);
  };

  return (
    <LyraDialog
      isOpen={isOpen}
      closeDialog={closeDialog}
      title={t('deleteDialog.title', { name: itemName })}
      titleIcon={WarningAmberIcon}
      forceDialog
    >
      <DialogContent>
        <Column spacing={2}>
          <DeleteDialogContent
            isLoadingPreview={isLoadingPreview}
            transactions={transactions}
            extraCount={extraCount > 0 ? extraCount : 0}
            hasTransactions={hasTransactions}
            showAutoMove={showAutoMove}
            showTransferRemovalHint={itemType === 'account'}
            showDropdown={showDropdown}
            replacementOptions={replacementOptions}
            selectedReplacementId={selectedReplacementId}
            onReplacementChange={setSelectedReplacementId}
          />
        </Column>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={closeDialog} disabled={isLoading}>
          {t('buttons.cancel')}
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={isConfirmDisabled}
          onClick={handleConfirm}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {t('deleteDialog.confirm')}
        </Button>
      </DialogActions>
    </LyraDialog>
  );
};

export default DeleteWithReassignDialog;
