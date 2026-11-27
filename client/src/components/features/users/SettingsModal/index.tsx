import { SvgIconComponent } from '@mui/icons-material';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import TuneIcon from '@mui/icons-material/Tune';
import { Box, DialogContent, Divider, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import LyraDialog, { BaseDialogProps } from '@/components/dialogs/LyraDialog';
import SettingsTabButton from '@/components/features/users/SettingsModal/SettingsTabButton';
import SettingsTabContent from '@/components/features/users/SettingsModal/SettingsTabContent';
import {
  getSettingsPanelStyle,
  getSettingsPaperStyle,
  getSettingsSidebarStyle,
} from '@/components/features/users/SettingsModal/styles';
import { SettingsTabKey } from '@/components/features/users/SettingsModal/types';
import UserDeletionDialog, {
  DeletionFeedbackPayload,
} from '@/components/features/users/UserDeletionDialog';
import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { API_ROUTES } from '@/constants/Routes';
import { useIsSmallScreen } from '@/hooks/common/useIsSmallScreen';
import { useOpen } from '@/hooks/common/useOpen';
import { useApiMutation } from '@/hooks/useApiMutation';
import { useAuth } from '@/providers/AuthProvider';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { isAndroidDevice, isIosDevice } from '@/utils/device';

// UA gating is convenience-only (show the relevant tab per device), not a security
// boundary — the shortcut token auth is the real gate on the ingest endpoints.
const isIphone = isIosDevice();
const isAndroid = isAndroidDevice();

const SettingsModal = ({ isOpen, closeDialog }: BaseDialogProps) => {
  const { t } = useTranslation('user');
  const { user, logout } = useAuth();
  const { alertSuccess, alertError } = useSnackbar();
  const [isDeletionDialogOpen, openDeletionDialog, closeDeletionDialog] = useOpen();
  const isSmallScreen = useIsSmallScreen();

  const [activeTab, setActiveTab] = useState<SettingsTabKey>('general');

  const deleteUser = useApiMutation<void, { feedback: DeletionFeedbackPayload }>({
    method: 'delete',
    url: `${API_ROUTES.USERS}/${user?._id}`,
    options: {
      onError: () => {
        alertError(t('deleteDialog.error'));
      },
    },
  });

  const confirmDeletion = (feedback: DeletionFeedbackPayload) => {
    deleteUser.mutate({ feedback });
  };

  const completeDeletion = () => {
    alertSuccess(t('deleteDialog.success'));
    logout();
  };

  const tabs: { key: SettingsTabKey; labelKey: string; icon: SvgIconComponent }[] = [
    { key: 'general', labelKey: 'settingsModal.tabs.general', icon: TuneIcon },
    {
      key: 'sharedHousehold',
      labelKey: 'settingsModal.tabs.sharedHousehold',
      icon: HomeWorkOutlinedIcon,
    },
    ...(isIphone
      ? [
          {
            key: 'applePay' as const,
            labelKey: 'settingsModal.tabs.applePay',
            icon: PhoneIphoneIcon,
          },
        ]
      : []),
    ...(isAndroid
      ? [
          {
            key: 'googlePay' as const,
            labelKey: 'settingsModal.tabs.googlePay',
            icon: PhoneAndroidIcon,
          },
        ]
      : []),
    {
      key: 'connectedApps',
      labelKey: 'settingsModal.tabs.connectedApps',
      icon: HubOutlinedIcon,
    },
  ];

  return (
    <>
      <LyraDialog
        isOpen={isOpen}
        closeDialog={closeDialog}
        title={t('settingsModal.title')}
        maxWidth="md"
        fullWidth
        sx={getSettingsPaperStyle()}
      >
        {!isSmallScreen && <Divider />}
        <DialogContent sx={{ p: 0, display: 'flex', minHeight: 0 }}>
          {isSmallScreen ? (
            <Column sx={{ width: '100%', height: '78dvh' }}>
              <Tabs
                value={activeTab}
                onChange={(_, value: SettingsTabKey) => setActiveTab(value)}
                variant={tabs.length > 3 ? 'scrollable' : 'fullWidth'}
                scrollButtons={false}
                sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
              >
                {tabs.map(tab => (
                  <Tab key={tab.key} value={tab.key} label={t(tab.labelKey)} />
                ))}
              </Tabs>
              <Box sx={getSettingsPanelStyle(isSmallScreen)}>
                <SettingsTabContent
                  activeTab={activeTab}
                  openDeletionDialog={openDeletionDialog}
                />
              </Box>
            </Column>
          ) : (
            <Row alignItems="stretch" sx={{ width: '100%', minHeight: 0 }}>
              <Column spacing={0.5} sx={getSettingsSidebarStyle()}>
                {tabs.map(tab => (
                  <SettingsTabButton
                    key={tab.key}
                    icon={tab.icon}
                    label={t(tab.labelKey)}
                    isActive={activeTab === tab.key}
                    onClick={() => setActiveTab(tab.key)}
                  />
                ))}
              </Column>
              <Box sx={getSettingsPanelStyle(isSmallScreen)}>
                <SettingsTabContent
                  activeTab={activeTab}
                  openDeletionDialog={openDeletionDialog}
                />
              </Box>
            </Row>
          )}
        </DialogContent>
      </LyraDialog>

      {isDeletionDialogOpen && (
        <UserDeletionDialog
          isOpen={isDeletionDialogOpen}
          closeDialog={closeDeletionDialog}
          onConfirm={confirmDeletion}
          isDeletionError={deleteUser.isError}
          isDeletionSuccess={deleteUser.isSuccess}
          onDeletionComplete={completeDeletion}
        />
      )}
    </>
  );
};

export default SettingsModal;
