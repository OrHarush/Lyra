import { DialogContent } from '@mui/material';
import { useTranslation } from 'react-i18next';

import LyraDialog, { BaseDialogProps } from '@/components/dialogs/LyraDialog';
import ChargeList from '@/pages/FixedExpenses/ChargeList';
import { FixedExpenseDto } from '@/types/FixedExpense';
import { FixedExpenseGroup } from '@/utils/entities/fixedExpenseGroups';

interface GroupDialogProps extends BaseDialogProps {
  group: FixedExpenseGroup;
  onEdit: (item: FixedExpenseDto) => void;
  onCancel: (item: FixedExpenseDto) => void;
}

const GroupDialog = ({ isOpen, closeDialog, group, onEdit, onCancel }: GroupDialogProps) => {
  const { t } = useTranslation('fixedExpenses');

  return (
    <LyraDialog
      isOpen={isOpen}
      closeDialog={closeDialog}
      title={t(`groups.${group.id}`)}
      fullWidth
      maxWidth="sm"
    >
      <DialogContent sx={{ pt: 1 }}>
        <ChargeList items={group.items} onEdit={onEdit} onCancel={onCancel} />
      </DialogContent>
    </LyraDialog>
  );
};

export default GroupDialog;
