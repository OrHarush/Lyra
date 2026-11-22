import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Button, Tooltip } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { copyToClipboard } from '@/utils/copyToClipboard';

import { fetchAdminSnapshot } from './fetchAdminSnapshot';

type CopyStatus = 'idle' | 'copied' | 'fetchError' | 'copyError';

const REVERT_DELAY_MS = 2000;

const LABEL_KEY: Record<CopyStatus, string> = {
  idle: 'snapshot.copy',
  copied: 'snapshot.copied',
  fetchError: 'snapshot.fetchError',
  copyError: 'snapshot.copyError',
};

const CopySnapshotButton = () => {
  const { t } = useTranslation('admin');
  const [status, setStatus] = useState<CopyStatus>('idle');
  const revertTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(
    () => () => {
      if (revertTimer.current) {
        clearTimeout(revertTimer.current);
      }
    },
    []
  );

  const scheduleRevert = () => {
    if (revertTimer.current) {
      clearTimeout(revertTimer.current);
    }

    revertTimer.current = setTimeout(() => setStatus('idle'), REVERT_DELAY_MS);
  };

  const copySnapshot = async () => {
    let json: string;

    try {
      const snapshot = await fetchAdminSnapshot();
      json = JSON.stringify(snapshot, null, 2);
    } catch {
      setStatus('fetchError');
      scheduleRevert();

      return;
    }

    try {
      await copyToClipboard(json);
      setStatus('copied');
    } catch {
      setStatus('copyError');
    }

    scheduleRevert();
  };

  const label = t(LABEL_KEY[status]);

  return (
    <Tooltip title={label}>
      <Button
        aria-label={label}
        variant="outlined"
        color={statusColor(status)}
        size="small"
        startIcon={statusIcon(status)}
        onClick={copySnapshot}
      >
        {label}
      </Button>
    </Tooltip>
  );
};

const statusIcon = (status: CopyStatus) => {
  if (status === 'copied') {
    return <CheckIcon fontSize="small" />;
  }

  if (status === 'fetchError' || status === 'copyError') {
    return <ErrorOutlineIcon fontSize="small" />;
  }

  return <ContentCopyIcon fontSize="small" />;
};

const statusColor = (status: CopyStatus): 'primary' | 'success' | 'error' => {
  if (status === 'copied') {
    return 'success';
  }

  if (status === 'fetchError' || status === 'copyError') {
    return 'error';
  }

  return 'primary';
};

export default CopySnapshotButton;
