import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Button, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { copyToClipboard } from '@/utils/copyToClipboard';

interface CopyableValueProps {
  label: string;
  value: string;
}

const CopyableValue = ({ label, value }: CopyableValueProps) => {
  const { t } = useTranslation('mcp');
  const { alertError } = useSnackbar();
  const [isCopied, setIsCopied] = useState(false);

  const copyValue = async () => {
    try {
      await copyToClipboard(value);
      setIsCopied(true);
    } catch {
      alertError(t('personalToken.copyError'));
    }
  };

  return (
    <Column spacing={0.5}>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      <Row
        spacing={1}
        alignItems="center"
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'action.hover',
          paddingInlineStart: 1.5,
          paddingInlineEnd: 0.5,
          py: 0.5,
        }}
      >
        <Typography
          dir="ltr"
          variant="body2"
          sx={{
            fontFamily: 'monospace',
            flex: 1,
            minWidth: 0,
            wordBreak: 'break-all',
            textAlign: 'start',
          }}
        >
          {value}
        </Typography>
        <Button
          size="small"
          onClick={copyValue}
          startIcon={isCopied ? <CheckIcon /> : <ContentCopyIcon />}
          sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          {isCopied ? t('personalToken.copied') : t('personalToken.copy')}
        </Button>
      </Row>
    </Column>
  );
};

export default CopyableValue;
