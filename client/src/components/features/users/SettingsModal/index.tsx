import { SvgIconComponent } from '@mui/icons-material';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import SettingsIcon from '@mui/icons-material/Settings';
import TuneIcon from '@mui/icons-material/Tune';
import { Box, DialogContent, List, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import LyraDialog, { BaseDialogProps } from '@/components/dialogs/LyraDialog';
import ApplePayShortcutSection from '@/components/features/users/SettingsModal/ApplePayShortcutSection';
import ConnectedAppsSection from '@/components/features/users/SettingsModal/ConnectedAppsSection';
import GeneralSettingsTab from '@/components/features/users/SettingsModal/GeneralSettingsTab';
import GooglePayShortcutSection from '@/components/features/users/SettingsModal/GooglePayShortcutSection';
import SettingsTabButton from '@/components/features/users/SettingsModal/SettingsTabButton';
import SharedHouseholdTab from '@/components/features/users/SettingsModal/SharedHouseholdTab';
import UserDeletionDialog, {
  DeletionFeedbackPayload,
} from '@/components/features/users/UserDeletionDialog';
import Row from '@/components/shared/layout/containers/Row';
import { API_ROUTES } from '@/constants/Routes';
import { useIsSmallScreen } from '@/hooks/common/useIsSmallScreen';
import { useOpen } from '@/hooks/common/useOpen';
import { useApiMutation } from '@/hooks/useApiMutation';
import { useAuth } from '@/providers/AuthProvider';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { isAndroidDevice, isIosDevice } from '@/utils/device';

type SettingsTabKey = 'general' | 'sharedHousehold' | 'applePay' | 'googlePay' | 'connectedApps';

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
        titleIcon={SettingsIcon}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ py: 1 }}>
          {isSmallScreen ? (
            <Box>
              <Tabs
                value={activeTab}
                onChange={(_, value: SettingsTabKey) => setActiveTab(value)}
                variant={tabs.length > 3 ? 'scrollable' : 'fullWidth'}
                scrollButtons={false}
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  position: 'sticky',
                  top: -8,
                  zIndex: 10,
                  bgcolor: 'background.paper',
                }}
              >
                {tabs.map(tab => (
                  <Tab key={tab.key} value={tab.key} label={t(tab.labelKey)} />
                ))}
              </Tabs>
              <Box sx={{ pt: 2 }}>
                {activeTab === 'general' && (
                  <GeneralSettingsTab openDeletionDialog={openDeletionDialog} />
                )}
                {activeTab === 'sharedHousehold' && <SharedHouseholdTab />}
                {activeTab === 'applePay' && <ApplePayShortcutSection />}
                {activeTab === 'googlePay' && <GooglePayShortcutSection />}
                {activeTab === 'connectedApps' && <ConnectedAppsSection />}
              </Box>
            </Box>
          ) : (
            <Row
              spacing={2}
              sx={{ pt: 1, alignItems: 'stretch', minHeight: 540 }}
            >
              <List
                sx={{
                  borderInlineEnd: 1,
                  borderColor: 'divider',
                  minWidth: 200,
                  py: 0,
                }}
              >
                {tabs.map(tab => (
                  <SettingsTabButton
                    key={tab.key}
                    icon={tab.icon}
                    label={t(tab.labelKey)}
                    isActive={activeTab === tab.key}
                    onClick={() => setActiveTab(tab.key)}
                  />
                ))}
              </List>
              <Box sx={{ flex: 1, minWidth: 0, px: 1 }}>
                {activeTab === 'general' && (
                  <GeneralSettingsTab openDeletionDialog={openDeletionDialog} />
                )}
                {activeTab === 'sharedHousehold' && <SharedHouseholdTab />}
                {activeTab === 'applePay' && <ApplePayShortcutSection />}
                {activeTab === 'googlePay' && <GooglePayShortcutSection />}
                {activeTab === 'connectedApps' && <ConnectedAppsSection />}
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
