import { useState } from 'react';

import {
  isMcpRequestGone,
  useApproveMcpConsent,
  useDenyMcpConsent,
} from '@/hooks/entities/useMcpConnections';
import { McpRedirect } from '@/types/McpConnection';

export const useMcpConsentDecision = (requestId: string) => {
  const approve = useApproveMcpConsent();
  const deny = useDenyMcpConsent();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const followRedirect = ({ redirectUrl }: McpRedirect) => {
    setIsRedirecting(true);
    window.location.assign(redirectUrl);
  };

  const allow = (workspaceId: string) => {
    deny.reset();
    approve.mutate({ requestId, workspaceId }, { onSuccess: followRedirect });
  };

  const reject = () => {
    approve.reset();
    deny.mutate(requestId, { onSuccess: followRedirect });
  };

  const error = approve.error ?? deny.error;

  return {
    allow,
    reject,
    isApproving: approve.isPending || (isRedirecting && approve.isSuccess),
    isDenying: deny.isPending || (isRedirecting && deny.isSuccess),
    isSubmitting: approve.isPending || deny.isPending || isRedirecting,
    isExpired: isMcpRequestGone(error),
    hasError: !!error,
  };
};
