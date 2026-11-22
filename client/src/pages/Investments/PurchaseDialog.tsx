import { Button, DialogActions, DialogContent } from '@mui/material';
import dayjs from 'dayjs';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import LyraDialog, { BaseDialogProps } from '@/components/dialogs/LyraDialog';
import AmountInput from '@/components/shared/inputs/AmountInput';
import { RHFDatePicker } from '@/components/shared/inputs/RHFDatePicker';
import Column from '@/components/shared/layout/containers/Column';
import { useOpen } from '@/hooks/common/useOpen';
import {
  useCreateInvestmentPurchase,
  useUpdateInvestmentPurchase,
} from '@/hooks/entities/useInvestmentMutations';
import AdvancedUnitsSection from '@/pages/Investments/AdvancedUnitsSection';
import DeletePurchaseDialog from '@/pages/Investments/DeletePurchaseDialog';
import FundSearchField from '@/pages/Investments/FundSearchField';
import {
  buildDefaultValues,
  fieldForServerError,
  PurchaseFormValues,
  readServerErrorKey,
  toCreateInput,
  toUpdateInput,
} from '@/pages/Investments/purchaseFormModel';
import { useSnackbar } from '@/providers/SnackbarProvider';
import type { InvestmentPurchaseDto } from '@/types/Investment';

interface PurchaseDialogProps extends BaseDialogProps {
  purchase?: InvestmentPurchaseDto;
}

const PurchaseDialog = ({ isOpen, closeDialog, purchase }: PurchaseDialogProps) => {
  const { t } = useTranslation('investments');
  const { t: tCommon } = useTranslation('common');
  const { alertSuccess, alertError } = useSnackbar();
  const createPurchase = useCreateInvestmentPurchase();
  const updatePurchase = useUpdateInvestmentPurchase();
  const [isDeleteOpen, openDelete, closeDelete] = useOpen();
  const isEditing = Boolean(purchase);
  const isSaving = createPurchase.isPending || updatePurchase.isPending;

  const methods = useForm<PurchaseFormValues>({
    defaultValues: buildDefaultValues(purchase),
    mode: 'onSubmit',
  });

  const fundCurrency = methods.watch('fund')?.currency ?? 'ILS';

  const showServerError = (error: unknown) => {
    const errorKey = readServerErrorKey(error);
    const field = fieldForServerError(errorKey);

    if (field) {
      methods.setError(field, { message: t(`errors.${errorKey}`) });

      return;
    }

    alertError(errorKey ? t(`errors.${errorKey}`) : t('errors.saveFailed'));
  };

  const savePurchase = async (values: PurchaseFormValues) => {
    try {
      if (purchase) {
        await updatePurchase.mutateAsync({ id: purchase.id, patch: toUpdateInput(values, purchase) });
        alertSuccess(t('toast.updated'));
      } else {
        await createPurchase.mutateAsync(toCreateInput(values));
        alertSuccess(t('toast.added'));
      }

      closeDialog();
    } catch (error) {
      showServerError(error);
    }
  };

  const closeBothDialogs = () => {
    closeDelete();
    closeDialog();
  };

  return (
    <LyraDialog
      isOpen={isOpen}
      closeDialog={closeDialog}
      title={isEditing ? t('dialog.editTitle') : t('dialog.addTitle')}
      maxWidth="sm"
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(savePurchase)} noValidate>
          <DialogContent sx={{ pt: 1, px: { xs: 0, sm: 2 } }}>
            <Column spacing={2}>
              <FundSearchField />
              <RHFDatePicker<PurchaseFormValues>
                name="date"
                label={t('dialog.date')}
                maxDate={dayjs()}
              />
              <AmountInput name="amount" label={t(fundCurrency === 'USD' ? 'dialog.amountUsd' : 'dialog.amountIls')} min={0.01} required />
              <AdvancedUnitsSection hasInitialValue={Boolean(methods.getValues('units'))} />
            </Column>
          </DialogContent>
          <DialogActions sx={{ px: { xs: 0, sm: 2 } }}>
            {isEditing && (
              <Button color="error" onClick={openDelete} sx={{ marginInlineEnd: 'auto' }}>
                {t('dialog.delete')}
              </Button>
            )}
            <Button onClick={closeDialog} variant="outlined">
              {tCommon('buttons.cancel')}
            </Button>
            <Button type="submit" variant="contained" loading={isSaving}>
              {isEditing ? t('dialog.submitSave') : t('dialog.submitAdd')}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
      {purchase && (
        <DeletePurchaseDialog
          isOpen={isDeleteOpen}
          closeDialog={closeDelete}
          purchaseId={purchase.id}
          onDeleted={closeBothDialogs}
        />
      )}
    </LyraDialog>
  );
};

export default PurchaseDialog;
