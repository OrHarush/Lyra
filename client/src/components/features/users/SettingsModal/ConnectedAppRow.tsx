import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { Button, Chip, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import {
  formatConnectionDate,
  formatLastUsed,
} from '@/components/features/users/SettingsModal/connectedAppDates';
import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { McpConnection } from '@/types/McpConnection';

interface ConnectedAppRowProps {
  connection: McpConnection;
  requestRevoke: () => void;
}

const ConnectedAppRow = ({ connection, requestRevoke }: ConnectedAppRowProps) => {
  const { t } = useTranslation('mcp');

  const KindIcon = connection.kind === 'oauth' ? SmartToyOutlinedIcon : KeyOutlinedIcon;
  const lastUsedLabel = connection.lastUsedAt
    ? t('connectedApps.lastUsed', { time: formatLastUsed(connection.lastUsedAt) })
    : t('connectedApps.neverUsed');

  const details = [
    connection.workspaceName,
    t('connectedApps.connectedOn', { date: formatConnectionDate(connection.createdAt) }),
    lastUsedLabel,
    ...(connection.expiresAt
      ? [t('connectedApps.expiresOn', { date: formatConnectionDate(connection.expiresAt) })]
      : []),
  ];

  return (
    <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
      <Row spacing={1.5} alignItems="center" justifyContent="space-between">
        <Row spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
          <KindIcon sx={{ color: 'text.secondary', mt: 0.25, flexShrink: 0 }} />
          <Column spacing={0.5} sx={{ minWidth: 0 }}>
            <Row spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
                {connection.name}
              </Typography>
              <Chip
                size="small"
                variant="outlined"
                color={connection.kind === 'oauth' ? 'primary' : 'default'}
                label={t(`connectedApps.kind.${connection.kind}`)}
              />
            </Row>
            <Typography variant="caption" color="text.secondary">
              {details.join(' · ')}
            </Typography>
          </Column>
        </Row>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={requestRevoke}
          sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          {t('connectedApps.revoke')}
        </Button>
      </Row>
    </Paper>
  );
};

export default ConnectedAppRow;
