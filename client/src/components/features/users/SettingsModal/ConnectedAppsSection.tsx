import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import { Button, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ConnectedAppRow from '@/components/features/users/SettingsModal/ConnectedAppRow';
import ConnectedAppsEmptyState from '@/components/features/users/SettingsModal/ConnectedAppsEmptyState';
import ConnectedAppsSkeleton from '@/components/features/users/SettingsModal/ConnectedAppsSkeleton';
import GenerateTokenDialog from '@/components/features/users/SettingsModal/GenerateTokenDialog';
import RevokeConnectionDialog from '@/components/features/users/SettingsModal/RevokeConnectionDialog';
import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { useOpen } from '@/hooks/common/useOpen';
import { useMcpConnections } from '@/hooks/entities/useMcpConnections';
import { McpConnection } from '@/types/McpConnection';

const ConnectedAppsSection = () => {
  const { t } = useTranslation('mcp');
  const connections = useMcpConnections();
  const [isTokenDialogOpen, openTokenDialog, closeTokenDialog] = useOpen();
  const [connectionToRevoke, setConnectionToRevoke] = useState<McpConnection | null>(null);

  const closeRevokeDialog = () => setConnectionToRevoke(null);

  return (
    <Column spacing={2.5}>
      <Row
        spacing={2}
        alignItems="flex-start"
        justifyContent="space-between"
        flexWrap="wrap"
        useFlexGap
      >
        <Column spacing={0.5} sx={{ flex: '1 1 240px', minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {t('connectedApps.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('connectedApps.description')}
          </Typography>
        </Column>
        <Button
          variant="outlined"
          size="small"
          startIcon={<KeyOutlinedIcon />}
          onClick={openTokenDialog}
          sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          {t('connectedApps.generateToken')}
        </Button>
      </Row>

      {connections.isPending && <ConnectedAppsSkeleton />}

      {connections.isError && (
        <Row spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="body2" color="error">
            {t('connectedApps.loadError')}
          </Typography>
          <Button size="small" onClick={() => connections.refetch()}>
            {t('connectedApps.retry')}
          </Button>
        </Row>
      )}

      {connections.data?.length === 0 && <ConnectedAppsEmptyState />}

      {!!connections.data?.length && (
        <Column spacing={1.5}>
          {connections.data.map(connection => (
            <ConnectedAppRow
              key={connection.id}
              connection={connection}
              requestRevoke={() => setConnectionToRevoke(connection)}
            />
          ))}
        </Column>
      )}

      {connectionToRevoke && (
        <RevokeConnectionDialog
          isOpen={!!connectionToRevoke}
          closeDialog={closeRevokeDialog}
          connection={connectionToRevoke}
        />
      )}

      {isTokenDialogOpen && (
        <GenerateTokenDialog isOpen={isTokenDialogOpen} closeDialog={closeTokenDialog} />
      )}
    </Column>
  );
};

export default ConnectedAppsSection;
