import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import { McpConsentWorkspace } from '@/types/McpConnection';

interface McpWorkspacePickerProps {
  workspaces: McpConsentWorkspace[];
  clientName: string;
  selectedWorkspaceId: string | null;
  selectWorkspace: (workspaceId: string) => void;
  disabled: boolean;
}

const McpWorkspacePicker = ({
  workspaces,
  clientName,
  selectedWorkspaceId,
  selectWorkspace,
  disabled,
}: McpWorkspacePickerProps) => {
  const { t } = useTranslation('mcp');

  return (
    <FormControl required disabled={disabled}>
      <FormLabel sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
        {t('consent.workspaceLabel')}
      </FormLabel>
      <RadioGroup
        value={selectedWorkspaceId ?? ''}
        onChange={(_, value) => selectWorkspace(value)}
        sx={{ gap: 1 }}
      >
        {workspaces.map(workspace => (
          <FormControlLabel
            key={workspace.id}
            value={workspace.id}
            control={<Radio />}
            label={
              <Column sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
                  {workspace.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t(`consent.workspaceTypes.${workspace.type}`)}
                </Typography>
              </Column>
            }
            sx={{
              m: 0,
              py: 0.75,
              paddingInlineEnd: 1.5,
              border: 1,
              borderRadius: 2,
              borderColor: selectedWorkspaceId === workspace.id ? 'primary.main' : 'divider',
            }}
          />
        ))}
      </RadioGroup>
      <FormHelperText sx={{ mx: 0, mt: 1 }}>
        {t('consent.workspaceHelper', { clientName })}
      </FormHelperText>
    </FormControl>
  );
};

export default McpWorkspacePicker;
