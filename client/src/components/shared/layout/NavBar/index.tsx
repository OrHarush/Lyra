import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import MenuIcon from '@mui/icons-material/Menu';
import { IconButton, Typography, useMediaQuery, useTheme } from '@mui/material';

import NotificationBell from '@/components/features/notifications/NotificationBell';
import Row from '@/components/shared/layout/containers/Row';
import Controls from '@/components/shared/layout/NavBar/Controls';
import NavBarContainer from '@/components/shared/layout/NavBar/NavBarContainer';
import ThemeToggleButton from '@/components/shared/layout/NavBar/ThemeToggleButton';
import { usePageHeaderContext } from '@/components/shared/layout/PageHeaderContext';
import LanguageSelect from '@/components/shared/ui/LanguageSelect';
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
      <NavBarContainer sx={{ flexWrap: 'nowrap', px: 1 }}>
        <Row alignItems="center">
          <IconButton
            onClick={onMobileOpen}
            size="medium"
            sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}
          >
            <MenuIcon />
          </IconButton>
          {navBarActions}
        </Row>
        {/* Takes the space left between the buttons, so the selector can never cover them. */}
        <Row flex={1} minWidth={0} justifyContent="center">
          {showDateSelector && dateConfig && (
            <MonthDateSelector value={dateConfig.value} onChange={dateConfig.onChange} />
          )}
        </Row>
        <Row alignItems="center">
          <ThemeToggleButton />
          <LanguageSelect sx={{ width: 36, height: 36, backgroundColor: 'transparent' }} />
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
