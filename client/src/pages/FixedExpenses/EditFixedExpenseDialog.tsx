import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateFixedExpenseDetailsDTO, UpdateFixedExpenseDetailsSchema } from '@lyra/shared';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormDialog from '@/components/dialogs/FormDialog';
import { BaseDialogProps } from '@/components/dialogs/LyraDialog';
import FixedExpenseKindFields from '@/components/features/fixedExpenses/FixedExpenseKindFields';
import { useUpdateFixedExpenseDetails } from '@/hooks/entities/useFixedExpenses';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { FixedExpenseDto } from '@/types/FixedExpense';

interface EditFixedExpenseDialogProps extends BaseDialogProps {
  item: FixedExpenseDto;
}

const EditFixedExpenseDialog = ({ isOpen, closeDialog, item }: EditFixedExpenseDialogProps) => {
  const { t } = useTranslation('fixedExpenses');
  const { alertSuccess, alertError } = useSnackbar();
  const updateDetails = useUpdateFixedExpenseDetails();

  const methods = useForm<UpdateFixedExpenseDetailsDTO>({
    resolver: zodResolver(UpdateFixedExpenseDetailsSchema),
    defaultValues: {
      kind: item.kind ?? 'regular',
      providerId: item.providerId ?? undefined,
      cancelUrl: item.cancelUrl ?? '',
      billType: item.billType ?? undefined,
    },
    mode: 'all',
  });

  const saveDetails = async (details: UpdateFixedExpenseDetailsDTO) => {
    try {
      await updateDetails.mutateAsync({ id: item._id, ...details });
      alertSuccess(t('toast.updated'));
    } catch {
      alertError(t('errors.updateFailed'));
    }
  };

  return (
    <FormProvider {...methods}>
      <FormDialog
        isOpen={isOpen}
        closeDialog={closeDialog}
        title={t('edit.title')}
        onSubmit={saveDetails}
        isUpdateForm
        maxWidth="sm"
      >
        <FixedExpenseKindFields />
      </FormDialog>
    </FormProvider>
  );
};

export default EditFixedExpenseDialog;
