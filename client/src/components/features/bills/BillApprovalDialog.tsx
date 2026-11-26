import { zodResolver } from '@hookform/resolvers/zod';
import { ApproveBillDTO, ApproveBillSchema } from '@lyra/shared';
import { Button, CircularProgress, DialogActions, DialogContent, Typography } from '@mui/material';
import { isAxiosError } from 'axios';
import dayjs from 'dayjs';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import LyraDialog, { BaseDialogProps } from '@/components/dialogs/LyraDialog';
import AmountInput from '@/components/shared/inputs/AmountInput';
import Column from '@/components/shared/layout/containers/Column';
import { useBillTitle } from '@/hooks/business/useBillTitle';
import { useIsSmallScreen } from '@/hooks/common/useIsSmallScreen';
import { useApproveBill } from '@/hooks/entities/useBills';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { PendingBillDto } from '@/types/Bill';

interface BillApprovalDialogProps extends BaseDialogProps {
  bill: PendingBillDto;
}

const ALREADY_HANDLED_STATUSES = [404, 409];

const isAlreadyHandled = (error: unknown) =>
  isAxiosError(error) && ALREADY_HANDLED_STATUSES.includes(error.response?.status ?? 0);

const BillApprovalDialog = ({ isOpen, closeDialog, bill }: BillApprovalDialogProps) => {
  const { t } = useTranslation('bills');
  const { t: tCommon } = useTranslation('common');
  const { alertSuccess, alertError, alertInfo } = useSnackbar();
  const isSmallScreen = useIsSmallScreen();
  const title = useBillTitle(bill);
  const approveBill = useApproveBill();

  const methods = useForm<ApproveBillDTO>({
    resolver: zodResolver(ApproveBillSchema),
    defaultValues: { amount: bill.amount },
    mode: 'all',
  });

  const submitApproval = async ({ amount }: ApproveBillDTO) => {
    try {
      await approveBill.mutateAsync({ transactionId: bill.transactionId, amount });
      alertSuccess(t('approval.success'));
      closeDialog();
    } catch (error) {
      if (isAlreadyHandled(error)) {
        alertInfo(t('approval.alreadyHandled'));
        closeDialog();
        return;
      }

      alertError(t('approval.error'));
    }
  };

  return (
    <FormProvider {...methods}>
      <LyraDialog isOpen={isOpen} closeDialog={closeDialog} title={title}>
        <form onSubmit={methods.handleSubmit(submitApproval)} noValidate>
          <DialogContent sx={{ pt: 1, px: { xs: 0, md: 3 } }}>
            <Column spacing={2}>
              <Column spacing={0.5}>
                {/* The mobile bottom sheet has no title bar of its own. */}
                {isSmallScreen && (
                  <Typography variant="h6" fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>
                    {title}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {t('approval.body', { date: dayjs(bill.date.split('T')[0]).format('DD/MM/YYYY') })}
                </Typography>
              </Column>
              <AmountInput name="amount" label={t('approval.amount')} required />
            </Column>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog} variant="outlined">
              {tCommon('buttons.cancel')}
            </Button>
            <Button type="submit" variant="contained" disabled={approveBill.isPending}>
              {approveBill.isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                t('approval.confirm')
              )}
            </Button>
          </DialogActions>
        </form>
      </LyraDialog>
    </FormProvider>
  );
};

export default BillApprovalDialog;
