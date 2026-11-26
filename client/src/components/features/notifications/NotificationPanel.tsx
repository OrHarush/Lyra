import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import NotificationListSkeleton from '@/components/features/notifications/NotificationListSkeleton';
import NotificationMessage from '@/components/features/notifications/NotificationMessage';
import NotificationSection from '@/components/features/notifications/NotificationSection';
import Column from '@/components/shared/layout/containers/Column';
import { NotificationDto } from '@/types/Notification';

interface NotificationPanelProps {
  actions: NotificationDto[];
  updates: NotificationDto[];
  isLoading: boolean;
  hasFailed: boolean;
  retry: () => void;
  closePanel: () => void;
}

const NotificationPanel = ({
  actions,
  updates,
  isLoading,
  hasFailed,
  retry,
  closePanel,
}: NotificationPanelProps) => {
  const { t } = useTranslation('notifications');
  const isEmpty = actions.length === 0 && updates.length === 0;

  const renderContent = () => {
    if (isLoading) {
      return <NotificationListSkeleton />;
    }

    if (hasFailed) {
      return (
        <NotificationMessage
          title={t('error.title')}
          action={{ label: t('error.retry'), onClick: retry }}
        />
      );
    }

    if (isEmpty) {
      return <NotificationMessage title={t('empty.title')} body={t('empty.body')} />;
    }

    return (
      <>
        {actions.length > 0 && (
          <NotificationSection
            title={t('sections.action')}
            notifications={actions}
            closePanel={closePanel}
          />
        )}
        {updates.length > 0 && (
          <NotificationSection
            title={t('sections.update')}
            notifications={updates}
            closePanel={closePanel}
          />
        )}
      </>
    );
  };

  return (
    <Column spacing={1.5}>
      <Typography variant="h6" fontWeight={700} sx={{ px: 1 }}>
        {t('title')}
      </Typography>
      {renderContent()}
    </Column>
  );
};

export default NotificationPanel;
