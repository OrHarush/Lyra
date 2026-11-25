import { Alert, Button, DialogActions, DialogContent } from '@mui/material';
import { useTranslation } from 'react-i18next';

import CopyableValue from '@/components/features/users/SettingsModal/CopyableValue';
import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { CreatedPersonalToken } from '@/types/McpConnection';

interface PersonalTokenRevealProps {
  createdToken: CreatedPersonalToken;
  closeDialog: () => void;
}

const PersonalTokenReveal = ({ createdToken, closeDialog }: PersonalTokenRevealProps) => {
  const { t } = useTranslation('mcp');

  return (
    <>
      <DialogContent sx={{ pt: 1 }}>
        <Column spacing={2}>
          <Alert severity="warning">{t('personalToken.warning')}</Alert>
          <CopyableValue label={t('personalToken.tokenLabel')} value={createdToken.token} />
          <CopyableValue label={t('personalToken.mcpUrlLabel')} value={createdToken.mcpUrl} />
        </Column>
      </DialogContent>
      <DialogActions>
        <Row spacing={1} sx={{ px: 2, pb: 1 }}>
          <Button variant="contained" onClick={closeDialog}>
            {t('personalToken.done')}
          </Button>
        </Row>
      </DialogActions>
    </>
  );
};

export default PersonalTokenReveal;
