import { Alert, Button, CircularProgress, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import LyraIcon from '@/pages/Login/LyraIcon';
import McpConsentNotice from '@/pages/McpConsent/McpConsentNotice';
import McpScopeList from '@/pages/McpConsent/McpScopeList';
import McpSignedInAs from '@/pages/McpConsent/McpSignedInAs';
import McpWorkspacePicker from '@/pages/McpConsent/McpWorkspacePicker';
import { useMcpConsentDecision } from '@/pages/McpConsent/useMcpConsentDecision';
import { McpConsentRequest } from '@/types/McpConnection';
import { UserDto } from '@/types/User';

interface McpConsentDetailsProps {
  request: McpConsentRequest;
  user: UserDto;
}

const McpConsentDetails = ({ request, user }: McpConsentDetailsProps) => {
  const { t } = useTranslation('mcp');
  const decision = useMcpConsentDecision(request.requestId);

  const defaultWorkspaceId = request.workspaces.find(({ isActive }) => isActive)?.id ?? null;
  const [chosenWorkspaceId, setChosenWorkspaceId] = useState<string | null>(null);
  const workspaceId = chosenWorkspaceId ?? defaultWorkspaceId;

  const allowAccess = () => {
    if (!workspaceId) {
      return;
    }

    decision.allow(workspaceId);
  };

  if (decision.isExpired) {
    return <McpConsentNotice title={t('consent.expiredTitle')} body={t('consent.expiredBody')} />;
  }

  return (
    <Column spacing={3}>
      <Column alignItems="center" sx={{ textAlign: 'center' }}>
        <LyraIcon size={64} />
        <Typography variant="h6" fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>
          {t('consent.title', { clientName: request.clientName })}
        </Typography>
      </Column>

      <McpScopeList />

      <McpWorkspacePicker
        workspaces={request.workspaces}
        clientName={request.clientName}
        selectedWorkspaceId={workspaceId}
        selectWorkspace={setChosenWorkspaceId}
        disabled={decision.isSubmitting}
      />

      <McpSignedInAs user={user} />

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textAlign: 'center', overflowWrap: 'anywhere' }}
      >
        {t('consent.redirectNotice', { host: request.redirectHost })}
      </Typography>

      {decision.hasError && <Alert severity="error">{t('consent.actionError')}</Alert>}

      <Row spacing={1.5}>
        <Button
          variant="outlined"
          size="large"
          onClick={decision.reject}
          disabled={decision.isSubmitting}
          sx={{ flex: 1, borderRadius: 2 }}
        >
          {decision.isDenying ? <CircularProgress size={22} color="inherit" /> : t('consent.deny')}
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={allowAccess}
          disabled={!workspaceId || decision.isSubmitting}
          sx={{ flex: 2, borderRadius: 2 }}
        >
          {decision.isApproving ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            t('consent.allow')
          )}
        </Button>
      </Row>
    </Column>
  );
};

export default McpConsentDetails;
