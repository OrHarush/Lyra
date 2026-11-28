import { Alert, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CopyableValue from '@/components/features/users/SettingsModal/CopyableValue';
import Column from '@/components/shared/layout/containers/Column';
import { useCreateAndroidAppToken } from '@/hooks/entities/useAndroidAppToken';

const AndroidAppTokenSection = () => {
  const { t } = useTranslation('user');
  const createToken = useCreateAndroidAppToken();
  const [token, setToken] = useState<string | null>(null);

  const createAppToken = () => {
    createToken.mutate(undefined, { onSuccess: response => setToken(response.data.token) });
  };

  return (
    <Paper variant="outlined" sx={{ mt: 3, p: { xs: 2, sm: 2.5 }, borderRadius: 2 }}>
      <Column spacing={2}>
        <Column spacing={0.5}>
          <Typography variant="subtitle2" fontWeight={700}>
            {t('settingsModal.androidApp.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('settingsModal.androidApp.description')}
          </Typography>
        </Column>

        {token && (
          <Column spacing={1.5}>
            <Alert severity="warning">{t('settingsModal.androidApp.warning')}</Alert>
            <CopyableValue label={t('settingsModal.androidApp.tokenLabel')} value={token} />
          </Column>
        )}

        {createToken.isError && (
          <Typography variant="caption" color="error">
            {t('settingsModal.androidApp.createError')}
          </Typography>
        )}

        <Button
          variant="outlined"
          size="small"
          onClick={createAppToken}
          disabled={createToken.isPending}
          startIcon={createToken.isPending ? <CircularProgress size={14} /> : undefined}
          sx={{ alignSelf: 'flex-start' }}
        >
          {t('settingsModal.androidApp.create')}
        </Button>
      </Column>
    </Paper>
  );
};

export default AndroidAppTokenSection;
