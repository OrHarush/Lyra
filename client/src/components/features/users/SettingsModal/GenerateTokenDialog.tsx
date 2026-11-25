import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import LyraDialog, { BaseDialogProps } from '@/components/dialogs/LyraDialog';
import GenerateTokenForm from '@/components/features/users/SettingsModal/GenerateTokenForm';
import PersonalTokenReveal from '@/components/features/users/SettingsModal/PersonalTokenReveal';
import { CreatedPersonalToken } from '@/types/McpConnection';

const GenerateTokenDialog = ({ isOpen, closeDialog }: BaseDialogProps) => {
  const { t } = useTranslation('mcp');
  const [createdToken, setCreatedToken] = useState<CreatedPersonalToken | null>(null);

  return (
    <LyraDialog
      isOpen={isOpen}
      closeDialog={closeDialog}
      title={createdToken ? t('personalToken.readyTitle') : t('personalToken.dialogTitle')}
      maxWidth="sm"
    >
      {createdToken ? (
        <PersonalTokenReveal createdToken={createdToken} closeDialog={closeDialog} />
      ) : (
        <GenerateTokenForm closeDialog={closeDialog} showCreatedToken={setCreatedToken} />
      )}
    </LyraDialog>
  );
};

export default GenerateTokenDialog;
