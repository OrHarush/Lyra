import ApplePayShortcutSection from '@/components/features/users/SettingsModal/ApplePayShortcutSection';
import ConnectedAppsSection from '@/components/features/users/SettingsModal/ConnectedAppsSection';
import GeneralSettingsTab from '@/components/features/users/SettingsModal/GeneralSettingsTab';
import GooglePayShortcutSection from '@/components/features/users/SettingsModal/GooglePayShortcutSection';
import SharedHouseholdTab from '@/components/features/users/SettingsModal/SharedHouseholdTab';
import { SettingsTabKey } from '@/components/features/users/SettingsModal/types';

interface SettingsTabContentProps {
  activeTab: SettingsTabKey;
  openDeletionDialog: () => void;
}

const SettingsTabContent = ({ activeTab, openDeletionDialog }: SettingsTabContentProps) => {
  switch (activeTab) {
    case 'general':
      return <GeneralSettingsTab openDeletionDialog={openDeletionDialog} />;
    case 'sharedHousehold':
      return <SharedHouseholdTab />;
    case 'applePay':
      return <ApplePayShortcutSection />;
    case 'googlePay':
      return <GooglePayShortcutSection />;
    case 'connectedApps':
      return <ConnectedAppsSection />;
  }
};

export default SettingsTabContent;
