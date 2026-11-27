import { SvgIconComponent } from '@mui/icons-material';
import {
  Box,
  Chip,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { getDesktopRowStyle } from '@/components/shared/layout/sidebar/SidebarButtons/styles';
import { useSidebar } from '@/components/shared/layout/sidebar/SidebarContext';

export interface SidebarButtonConfig {
  titleKey: string;
  icon: SvgIconComponent;
  route: string;
  badge?: string;
  activePathPrefix?: string;
}

interface SidebarNavigationButtonProps {
  button: SidebarButtonConfig;
  isActive: boolean;
  title: string;
  nested?: boolean;
  compact?: boolean;
}

const SidebarNavigationButton = ({
  button,
  isActive,
  title,
  nested = false,
  compact = false,
}: SidebarNavigationButtonProps) => {
  const navigate = useNavigate();
  const { expanded } = useSidebar();
  const Icon = button.icon;

  return (
    <Tooltip title={!expanded ? title : ''} placement="right">
      <ListItem sx={compact ? getDesktopRowStyle() : { padding: '4px 8px' }}>
        <ListItemButton
          onClick={() => navigate(button.route)}
          sx={{
            borderRadius: '12px',
            height: compact ? '100%' : '44px',
            backgroundColor: 'transparent',
            transition: 'color 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: isActive ? 'transparent' : 'action.hover',
            },
            display: 'flex',
            justifyContent: expanded ? 'space-between' : 'center',
            alignItems: 'center',
            px: expanded ? undefined : 0,
            pl: expanded && nested ? 4 : undefined,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              minWidth: 0,
              flex: expanded ? 1 : 'unset',
            }}
          >
            <ListItemIcon sx={{ minWidth: 24, mr: expanded ? 1 : 0 }}>
              <Icon color={isActive ? 'primary' : 'inherit'} />
            </ListItemIcon>
            {expanded && (
              <ListItemText
                primary={title}
                sx={{
                  color: isActive ? 'primary.main' : 'inherit',
                  transition: 'color 0.2s ease-in-out',
                }}
              />
            )}
          </Box>
          {expanded && button.badge && (
            <Chip
              label={button.badge}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 500,
                ml: 1,
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
              }}
            />
          )}
        </ListItemButton>
      </ListItem>
    </Tooltip>
  );
};

export default SidebarNavigationButton;
