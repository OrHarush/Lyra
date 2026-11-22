import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { IconButton, Tooltip } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { copyToClipboard } from '@/utils/copyToClipboard';

type CopyStatus = 'idle' | 'copied' | 'failed';

interface CopyCalculationButtonProps {
  getText: () => string;
}

const REVERT_DELAY_MS = 2000;

const STATUS_ICONS = {
  idle: <ContentCopyIcon fontSize="inherit" />,
  copied: <CheckIcon fontSize="inherit" color="success" />,
  failed: <ErrorOutlineIcon fontSize="inherit" color="error" />,
};

const CopyCalculationButton = ({ getText }: CopyCalculationButtonProps) => {
  const { t } = useTranslation('calculators');
  const [status, setStatus] = useState<CopyStatus>('idle');
  const revertTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(
    () => () => {
      clearTimeout(revertTimer.current);
    },
    []
  );

  const copyCalculation = async () => {
    try {
      await copyToClipboard(getText());
      setStatus('copied');
    } catch {
      setStatus('failed');
    }

    clearTimeout(revertTimer.current);
    revertTimer.current = setTimeout(() => setStatus('idle'), REVERT_DELAY_MS);
  };

  const label = t(status === 'idle' ? 'netSalary.copy.action' : `netSalary.copy.${status}`);

  return (
    <Tooltip title={label}>
      <IconButton
        size="small"
        aria-label={label}
        onClick={copyCalculation}
        sx={{ fontSize: 18, my: -0.5, marginInlineEnd: -0.5 }}
      >
        {STATUS_ICONS[status]}
      </IconButton>
    </Tooltip>
  );
};

export default CopyCalculationButton;
