import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { ROUTES } from '@/constants/Routes';
import { isMcpRequestGone, useMcpConsentRequest } from '@/hooks/entities/useMcpConnections';
import McpConsentCard from '@/pages/McpConsent/McpConsentCard';
import McpConsentDetails from '@/pages/McpConsent/McpConsentDetails';
import McpConsentNotice from '@/pages/McpConsent/McpConsentNotice';
import McpConsentSkeleton from '@/pages/McpConsent/McpConsentSkeleton';
import { useAuth } from '@/providers/AuthProvider';

const buildLoginRedirect = (requestId: string | null) => {
  const consentPath = `${ROUTES.MCP_CONSENT_URL}?request=${encodeURIComponent(requestId ?? '')}`;

  return `${ROUTES.LOGIN_URL}?next=${encodeURIComponent(consentPath)}`;
};

const McpConsentPage = () => {
  const { t } = useTranslation('mcp');
  const { user, isLoadingUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('request');

  const consentRequest = useMcpConsentRequest(requestId);

  useEffect(() => {
    if (isLoadingUser || user) {
      return;
    }

    navigate(buildLoginRedirect(requestId), { replace: true });
  }, [isLoadingUser, user, requestId, navigate]);

  if (!requestId || isMcpRequestGone(consentRequest.error)) {
    return (
      <McpConsentCard>
        <McpConsentNotice title={t('consent.expiredTitle')} body={t('consent.expiredBody')} />
      </McpConsentCard>
    );
  }

  if (consentRequest.isError) {
    return (
      <McpConsentCard>
        <McpConsentNotice
          title={t('consent.loadErrorTitle')}
          body={t('consent.loadErrorBody')}
          retry={() => consentRequest.refetch()}
        />
      </McpConsentCard>
    );
  }

  if (isLoadingUser || !user || !consentRequest.data) {
    return (
      <McpConsentCard>
        <McpConsentSkeleton />
      </McpConsentCard>
    );
  }

  return (
    <McpConsentCard>
      <McpConsentDetails request={consentRequest.data} user={user} />
    </McpConsentCard>
  );
};

export default McpConsentPage;
