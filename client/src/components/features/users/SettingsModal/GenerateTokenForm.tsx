import { zodResolver } from '@hookform/resolvers/zod';
import { Button, CircularProgress, DialogActions, DialogContent, Typography } from '@mui/material';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import RHFSelect from '@/components/shared/inputs/RHFSelect';
import TextInput from '@/components/shared/inputs/TextInput';
import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { queryKeys } from '@/constants/queryKeys';
import { API_ROUTES } from '@/constants/Routes';
import { useFetch } from '@/hooks/common/useFetch';
import { useCreateMcpPersonalToken } from '@/hooks/entities/useMcpConnections';
import { useAuth } from '@/providers/AuthProvider';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { CreatedPersonalToken } from '@/types/McpConnection';
import { WorkspaceListItemDto } from '@/types/Workspace';

const TOKEN_NAME_MAX_LENGTH = 50;

const personalTokenSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'validation.required')
    .max(TOKEN_NAME_MAX_LENGTH, 'validation.nameTooLong'),
  workspaceId: z.string().min(1, 'validation.required'),
});

type PersonalTokenFormValues = z.infer<typeof personalTokenSchema>;

const resolveDefaultWorkspaceId = (
  workspaces: WorkspaceListItemDto[],
  activeWorkspaceId: string | undefined
): string => {
  const active = workspaces.find(({ workspace }) => workspace._id === activeWorkspaceId);
  const personal = workspaces.find(({ workspace }) => workspace.type === 'personal');

  return (active ?? personal ?? workspaces[0])?.workspace._id ?? '';
};

interface GenerateTokenFormProps {
  closeDialog: () => void;
  showCreatedToken: (createdToken: CreatedPersonalToken) => void;
}

const GenerateTokenForm = ({ closeDialog, showCreatedToken }: GenerateTokenFormProps) => {
  const { t } = useTranslation('mcp');
  const { user } = useAuth();
  const { alertError } = useSnackbar();
  const createToken = useCreateMcpPersonalToken();

  const { data: workspaces } = useFetch<WorkspaceListItemDto[]>({
    url: API_ROUTES.WORKSPACES,
    queryKey: queryKeys.workspaces(),
  });

  const methods = useForm<PersonalTokenFormValues>({
    resolver: zodResolver(personalTokenSchema),
    mode: 'onTouched',
    defaultValues: { name: '', workspaceId: '' },
  });
  const { getValues, setValue, handleSubmit } = methods;

  useEffect(() => {
    if (!workspaces || getValues('workspaceId')) {
      return;
    }

    setValue('workspaceId', resolveDefaultWorkspaceId(workspaces, user?.activeWorkspaceId));
  }, [workspaces, user?.activeWorkspaceId, getValues, setValue]);

  const workspaceOptions = (workspaces ?? []).map(({ workspace }) => ({
    value: workspace._id,
    label: workspace.name,
  }));

  const generateToken = (values: PersonalTokenFormValues) => {
    createToken.mutate(values, {
      onSuccess: showCreatedToken,
      onError: () => alertError(t('personalToken.createError')),
    });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(generateToken)} noValidate>
        <DialogContent sx={{ pt: 1 }}>
          <Column spacing={2}>
            <Typography variant="body2" color="text.secondary">
              {t('personalToken.description')}
            </Typography>
            <TextInput
              name="name"
              label={t('personalToken.nameLabel')}
              placeholder={t('personalToken.namePlaceholder')}
            />
            <Column spacing={0.5}>
              <RHFSelect
                name="workspaceId"
                label={t('personalToken.workspaceLabel')}
                options={workspaceOptions}
                fullWidth
              />
              <Typography variant="caption" color="text.secondary" sx={{ px: 1.5 }}>
                {t('personalToken.workspaceHelper')}
              </Typography>
            </Column>
          </Column>
        </DialogContent>
        <DialogActions>
          <Row spacing={1} sx={{ px: 2, pb: 1 }}>
            <Button variant="outlined" onClick={closeDialog} disabled={createToken.isPending}>
              {t('personalToken.cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createToken.isPending || !workspaces}
              startIcon={
                createToken.isPending ? <CircularProgress size={16} color="inherit" /> : undefined
              }
            >
              {t('personalToken.create')}
            </Button>
          </Row>
        </DialogActions>
      </form>
    </FormProvider>
  );
};

export default GenerateTokenForm;
