import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { Badge, IconButton, Popover, useTheme } from '@mui/material';
import { MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import LyraDialog from '@/components/dialogs/LyraDialog';
import NotificationPanel from '@/components/features/notifications/NotificationPanel';
import { useUnseenUpdates } from '@/components/features/notifications/useUnseenUpdates';
import { useIsSmallScreen } from '@/hooks/common/useIsSmallScreen';
import { useNotifications } from '@/hooks/entities/useNotifications';

const MAX_BADGE_COUNT = 9;

const NotificationBell = () => {
  const { t } = useTranslation('notifications');
  const theme = useTheme();
  const isSmallScreen = useIsSmallScreen();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const { actions, updates, isLoading, isError, data, refetch } = useNotifications();
  const { hasUnseenUpdates, markUpdatesSeen } = useUnseenUpdates(updates);

  const isOpen = !!anchor;
  const showsUpdatesDot = actions.length === 0 && hasUnseenUpdates;
  // Popover positions are computed in script, so the RTL style plugin can't mirror them.
  const endSide = theme.direction === 'rtl' ? 'left' : 'right';

  const openPanel = (event: MouseEvent<HTMLElement>) => {
    setAnchor(event.currentTarget);
    markUpdatesSeen();
    refetch();
  };

  const closePanel = () => setAnchor(null);

  const panel = (
    <NotificationPanel
      actions={actions}
      updates={updates}
      isLoading={isLoading}
      hasFailed={isError && !data}
      retry={refetch}
      closePanel={closePanel}
    />
  );

  return (
    <>
      <IconButton
        onClick={openPanel}
        aria-label={t('bellLabel', { count: actions.length })}
        sx={{ width: { xs: 36, md: 40 }, height: { xs: 36, md: 40 }, color: 'text.secondary' }}
      >
        <Badge
          badgeContent={actions.length}
          max={MAX_BADGE_COUNT}
          color={showsUpdatesDot ? 'primary' : 'error'}
          variant={showsUpdatesDot ? 'dot' : 'standard'}
          invisible={actions.length === 0 && !showsUpdatesDot}
        >
          <NotificationsNoneIcon fontSize="small" />
        </Badge>
      </IconButton>
      {isSmallScreen ? (
        <LyraDialog isOpen={isOpen} closeDialog={closePanel} title={t('title')}>
          {panel}
        </LyraDialog>
      ) : (
        <Popover
          open={isOpen}
          anchorEl={anchor}
          onClose={closePanel}
          anchorOrigin={{ vertical: 'bottom', horizontal: endSide }}
          transformOrigin={{ vertical: 'top', horizontal: endSide }}
          slotProps={{
            paper: { sx: { width: 360, maxHeight: '70vh', p: 1.5, borderRadius: 3 } },
          }}
        >
          {panel}
        </Popover>
      )}
    </>
  );
};

export default NotificationBell;
