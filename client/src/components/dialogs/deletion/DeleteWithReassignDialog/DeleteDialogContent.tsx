import { FormControl, InputLabel, MenuItem, Select, Skeleton } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import TransactionPreviewList from '@/components/features/transactions/TransactionPreviewList';
import { TransactionDto } from '@/types/Transaction';

interface DeleteDialogContentProps {
  isLoadingPreview: boolean;
  transactions: TransactionDto[];
  extraCount: number;
  hasTransactions: boolean;
  showAutoMove: boolean;
  showTransferRemovalHint: boolean;
  showDropdown: boolean;
  replacementOptions: { id: string; label: string }[];
  selectedReplacementId: string;
  onReplacementChange: (id: string) => void;
}

const DeleteDialogContent = ({
  isLoadingPreview,
  transactions,
  extraCount,
  hasTransactions,
  showAutoMove,
  showTransferRemovalHint,
  showDropdown,
  replacementOptions,
  selectedReplacementId,
  onReplacementChange,
}: DeleteDialogContentProps) => {
  const { t } = useTranslation(['common']);

  if (isLoadingPreview) {
    return (
      <>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="rounded" height={36} />
        <Skeleton variant="rounded" height={36} />
      </>
    );
  }

  if (!hasTransactions) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t('deleteDialog.noTransactions')}
      </Typography>
    );
  }

  return (
    <>
      <Typography variant="body2" color="text.secondary">
        {t('deleteDialog.transactionsPreview')}
      </Typography>
      <TransactionPreviewList transactions={transactions} extraCount={extraCount} />
      {showAutoMove && (
        <Typography variant="body2" color="text.secondary">
          {t('deleteDialog.transactionsWillBeMovedTo', { name: replacementOptions[0].label })}
        </Typography>
      )}
      {showTransferRemovalHint && (
        <Typography variant="caption" color="text.secondary">
          {t('deleteDialog.transfersBetweenRemoved')}
        </Typography>
      )}
      {showDropdown && (
        <FormControl fullWidth size="small">
          <InputLabel>{t('deleteDialog.moveTransactionsTo')}</InputLabel>
          <Select
            value={selectedReplacementId}
            onChange={e => onReplacementChange(e.target.value)}
            label={t('deleteDialog.moveTransactionsTo')}
          >
            {replacementOptions.map(opt => (
              <MenuItem key={opt.id} value={opt.id}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </>
  );
};

export default DeleteDialogContent;
