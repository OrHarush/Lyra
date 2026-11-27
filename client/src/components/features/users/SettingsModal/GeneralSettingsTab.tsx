import DownloadIcon from '@mui/icons-material/Download';
import { Button, IconButton, MenuItem, Select, Switch } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { downloadMyData, downloadWorkspaceData } from '@/api/users';
import DangerZone from '@/components/features/users/SettingsModal/DangerZone';
import ExportPickerDialog from '@/components/features/users/SettingsModal/ExportPickerDialog';
import LanguageSetting from '@/components/features/users/SettingsModal/LanguageSetting';
import SettingsGroup from '@/components/features/users/SettingsModal/SettingsGroup';
import SettingsRow from '@/components/features/users/SettingsModal/SettingsRow';
import Column from '@/components/shared/layout/containers/Column';
import { CURRENCIES } from '@/constants/currencies';
import { queryKeys } from '@/constants/queryKeys';
import { API_ROUTES } from '@/constants/Routes';
import { useFetch } from '@/hooks/common/useFetch';
import { useIsSmallScreen } from '@/hooks/common/useIsSmallScreen';
import { useOpen } from '@/hooks/common/useOpen';
import { useApiMutation } from '@/hooks/useApiMutation';
import { useAuth } from '@/providers/AuthProvider';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { UserDto } from '@/types/User';
import { WorkspaceListItemDto } from '@/types/Workspace';

interface UpdatePreferencesDto {
  displayCurrency: string;
}

interface UpdateConsentDto {
  analyticsConsent: 'accepted' | 'rejected';
}

interface GeneralSettingsTabProps {
  openDeletionDialog: () => void;
}

const GeneralSettingsTab = ({ openDeletionDialog }: GeneralSettingsTabProps) => {
  const { t } = useTranslation('user');
  const { user, updateUser } = useAuth();
  const { alertSuccess, alertError } = useSnackbar();
  const isSmallScreen = useIsSmallScreen();

  const [selectedCurrency, setSelectedCurrency] = useState(user?.displayCurrency ?? 'ILS');
  const [isDownloadingData, setIsDownloadingData] = useState(false);
  const [isPickerOpen, openPicker, closePicker] = useOpen();

  const { data: workspaces } = useFetch<WorkspaceListItemDto[]>({
    url: API_ROUTES.WORKSPACES,
    queryKey: queryKeys.workspaces(),
  });

  const downloadActiveWorkspaceData = async () => {
    setIsDownloadingData(true);

    try {
      if (workspaces && workspaces.length === 1) {
        await downloadWorkspaceData(workspaces[0].workspace._id);
      } else {
        await downloadMyData();
      }
    } catch {
      alertError(t('settingsModal.downloadDataError'));
    } finally {
      setIsDownloadingData(false);
    }
  };

  const startDownloadFlow = () => {
    if (workspaces && workspaces.length >= 2) {
      openPicker();
      return;
    }

    void downloadActiveWorkspaceData();
  };

  const updatePreferences = useApiMutation<UserDto, UpdatePreferencesDto>({
    method: 'patch',
    url: API_ROUTES.USERS_PREFERENCES,
    queryKeysToInvalidate: [queryKeys.user()],
    options: {
      onMutate: async ({ displayCurrency }) => {
        const previousUser = user;

        if (user) {
          updateUser({ ...user, displayCurrency });
        }

        return { previousUser };
      },
      onError: (_, __, context) => {
        const ctx = context as { previousUser: UserDto | null };

        if (ctx?.previousUser) {
          updateUser(ctx.previousUser);
          setSelectedCurrency(ctx.previousUser.displayCurrency ?? 'ILS');
        }

        alertError(t('settingsModal.updateError'));
      },
      onSuccess: () => {
        alertSuccess(t('settingsModal.updateSuccess'));
      },
    },
  });

  const updateConsent = useApiMutation<UserDto, UpdateConsentDto>({
    method: 'patch',
    url: API_ROUTES.USERS_CONSENT,
    queryKeysToInvalidate: [queryKeys.user()],
    options: {
      onMutate: ({ analyticsConsent }) => {
        const previousUser = user;

        if (user) {
          updateUser({ ...user, analyticsConsent });
        }

        return { previousUser };
      },
      onError: (_, __, context) => {
        const ctx = context as { previousUser: UserDto | null };

        if (ctx?.previousUser) {
          updateUser(ctx.previousUser);
        }

        alertError(t('settingsModal.updateError'));
      },
    },
  });

  const toggleAnalyticsConsent = (accepted: boolean) => {
    updateConsent.mutate({ analyticsConsent: accepted ? 'accepted' : 'rejected' });
  };

  const changeCurrency = (currency: string) => {
    setSelectedCurrency(currency);
    updatePreferences.mutate({ displayCurrency: currency });
  };

  return (
    <Column spacing={3}>
      <SettingsGroup title={t('settingsModal.general')}>
        <LanguageSetting />
        <SettingsRow
          label={t('settingsModal.currency')}
          helper={t('settingsModal.currencyHelper')}
        >
          <Select
            size="small"
            value={selectedCurrency}
            onChange={e => changeCurrency(e.target.value)}
            inputProps={{ 'aria-label': t('settingsModal.currency') }}
            sx={{ width: 160, flexShrink: 0 }}
          >
            {CURRENCIES.map(c => (
              <MenuItem key={c.value} value={c.value}>
                {c.label}
              </MenuItem>
            ))}
          </Select>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title={t('settingsModal.privacy')}>
        <SettingsRow
          label={t('settingsModal.analyticsLabel')}
          helper={t('settingsModal.analyticsHelper')}
        >
          <Switch
            checked={user?.analyticsConsent === 'accepted'}
            onChange={(_, checked) => toggleAnalyticsConsent(checked)}
            disabled={updateConsent.isPending}
            inputProps={{ 'aria-label': t('settingsModal.analyticsLabel') }}
            sx={{ flexShrink: 0 }}
          />
        </SettingsRow>
        <SettingsRow
          label={t('settingsModal.essentialLabel')}
          helper={t('settingsModal.essentialHelper')}
        >
          <Switch
            checked
            disabled
            inputProps={{ 'aria-label': t('settingsModal.essentialLabel') }}
            sx={{ flexShrink: 0 }}
          />
        </SettingsRow>
        <SettingsRow
          label={t('settingsModal.yourDataLabel')}
          helper={t('settingsModal.yourDataHelper')}
        >
          {isSmallScreen ? (
            <IconButton
              color="primary"
              onClick={startDownloadFlow}
              disabled={isDownloadingData}
              aria-label={t('settingsModal.downloadDataButton')}
              sx={{ flexShrink: 0 }}
            >
              <DownloadIcon />
            </IconButton>
          ) : (
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={startDownloadFlow}
              disabled={isDownloadingData}
              startIcon={<DownloadIcon />}
              sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              {t('settingsModal.downloadDataButton')}
            </Button>
          )}
        </SettingsRow>
      </SettingsGroup>

      <DangerZone openDeletionDialog={openDeletionDialog} />

      {isPickerOpen && workspaces && (
        <ExportPickerDialog
          isOpen={isPickerOpen}
          closeDialog={closePicker}
          workspaces={workspaces}
        />
      )}
    </Column>
  );
};

export default GeneralSettingsTab;
