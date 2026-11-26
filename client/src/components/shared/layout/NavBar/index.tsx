import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material';

import NotificationBell from '@/components/features/notifications/NotificationBell';
import Row from '@/components/shared/layout/containers/Row';
import Controls from '@/components/shared/layout/NavBar/Controls';
import NavBarContainer from '@/components/shared/layout/NavBar/NavBarContainer';
import { usePageHeaderContext } from '@/components/shared/layout/PageHeaderContext';
import MonthDateSelector from '@/components/shared/ui/MonthDateSelector';

interface NavBarProps {
  onMobileOpen: () => void;
  sidebarExpanded: boolean;
  onToggleSidebar: () => void;
}

const NavBar = ({ onMobileOpen, sidebarExpanded, onToggleSidebar }: NavBarProps) => {
  const theme = useTheme();
  const isHandDevice = useMediaQuery(theme.breakpoints.down('md'));
  const { title, showDateSelector, navBarActions, dateConfig } = usePageHeaderContext();
  const isRtl = theme.direction === 'rtl';

  const CollapseIcon = isRtl ? KeyboardDoubleArrowRightIcon : KeyboardDoubleArrowLeftIcon;
  const ExpandIcon = isRtl ? KeyboardDoubleArrowLeftIcon : KeyboardDoubleArrowRightIcon;
  const SidebarToggleIcon = sidebarExpanded ? CollapseIcon : ExpandIcon;

  if (isHandDevice) {
    return (
      <NavBarContainer sx={{ position: 'relative', flexWrap: 'nowrap' }}>
        <Row spacing={1} alignItems="center">
          <IconButton
            onClick={onMobileOpen}
            size="medium"
            sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}
          >
            <MenuIcon />
          </IconButton>
          {navBarActions}
        </Row>
        {showDateSelector && dateConfig && (
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 0,
            }}
          >
            <MonthDateSelector value={dateConfig.value} onChange={dateConfig.onChange} />
          </Box>
        )}
        <Row alignItems="center" sx={{ marginInlineStart: 'auto' }}>
          <NotificationBell />
        </Row>
      </NavBarContainer>
    );
  }

  return (
    <NavBarContainer>
      <IconButton onClick={onToggleSidebar} size="small">
        <SidebarToggleIcon fontSize="small" />
      </IconButton>
      {title && (
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ mx: 1.5, whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          {title}
        </Typography>
      )}
      {navBarActions}
      <Controls />
    </NavBarContainer>
  );
};

export default NavBar;
