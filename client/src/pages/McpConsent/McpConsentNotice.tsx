import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';

interface McpConsentNoticeProps {
  title: string;
  body: string;
  retry?: () => void;
}

const McpConsentNotice = ({ title, body, retry }: McpConsentNoticeProps) => {
  const { t } = useTranslation('mcp');

  return (
    <Column spacing={2.5} alignItems="center" sx={{ textAlign: 'center' }}>
      <ErrorOutlineIcon color="warning" sx={{ fontSize: 56 }} />
      <Typography variant="h6" fontWeight={700}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {body}
      </Typography>
      {retry && (
        <Button variant="outlined" onClick={retry}>
          {t('consent.retry')}
        </Button>
      )}
    </Column>
  );
};

export default McpConsentNotice;
