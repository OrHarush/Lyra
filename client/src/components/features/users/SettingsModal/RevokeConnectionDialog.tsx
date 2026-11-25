import { Button, CircularProgress, DialogActions, DialogContent, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import LyraDialog, { BaseDialogProps } from '@/components/dialogs/LyraDialog';
import Row from '@/components/shared/layout/containers/Row';
import { useRevokeMcpConnection } from '@/hooks/entities/useMcpConnections';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { McpConnection } from '@/types/McpConnection';

interface RevokeConnectionDialogProps extends BaseDialogProps {
  connection: McpConnection;
}

const RevokeConnectionDialog = ({
  isOpen,
  closeDialog,
  connection,
}: RevokeConnectionDialogProps) => {
  const { t } = useTranslation('mcp');
  const { alertSuccess, alertError } = useSnackbar();
  const revoke = useRevokeMcpConnection();

  const revokeConnection = () => {
    revoke.mutate(connection.id, {
      onSuccess: () => {
        alertSuccess(t('connectedApps.revokeDialog.success'));
        closeDialog();
      },
      onError: () => alertError(t('connectedApps.revokeDialog.error')),
    });
  };

  return (
    <LyraDialog
      isOpen={isOpen}
      closeDialog={closeDialog}
      title={t('connectedApps.revokeDialog.title', { name: connection.name })}
      maxWidth="xs"
      forceDialog
    >
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {t('connectedApps.revokeDialog.body', { name: connection.name })}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Row spacing={1} sx={{ px: 2, pb: 1 }}>
          <Button variant="outlined" onClick={closeDialog} disabled={revoke.isPending}>
            {t('connectedApps.revokeDialog.cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={revokeConnection}
            disabled={revoke.isPending}
            startIcon={
              revoke.isPending ? <CircularProgress size={16} color="inherit" /> : undefined
            }
          >
            {t('connectedApps.revokeDialog.confirm')}
          </Button>
        </Row>
      </DialogActions>
    </LyraDialog>
  );
};

export default RevokeConnectionDialog;
