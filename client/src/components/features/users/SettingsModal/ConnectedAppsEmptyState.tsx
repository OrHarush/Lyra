import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';

const ConnectedAppsEmptyState = () => {
  const { t } = useTranslation('mcp');

  return (
    <Column
      spacing={1.5}
      alignItems="center"
      textAlign="center"
      sx={{
        py: 5,
        px: 2,
        border: 1,
        borderColor: 'divider',
        borderStyle: 'dashed',
        borderRadius: 2,
      }}
    >
      <HubOutlinedIcon sx={{ fontSize: '2.75rem', color: 'primary.main', opacity: 0.85 }} />
      <Typography variant="subtitle1" fontWeight={600}>
        {t('connectedApps.empty.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380 }}>
        {t('connectedApps.empty.body')}
      </Typography>
    </Column>
  );
};

export default ConnectedAppsEmptyState;
