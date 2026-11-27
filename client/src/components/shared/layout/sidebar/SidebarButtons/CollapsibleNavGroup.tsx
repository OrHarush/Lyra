import { SvgIconComponent } from '@mui/icons-material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { ReactNode, useEffect, useRef } from 'react';

import { getDesktopRowStyle } from '@/components/shared/layout/sidebar/SidebarButtons/styles';
import { useSidebar } from '@/components/shared/layout/sidebar/SidebarContext';

interface CollapsibleNavGroupProps {
  title: string;
  icon: SvgIconComponent;
  hasActiveItem: boolean;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

const CollapsibleNavGroup = ({
  title,
  icon: Icon,
  hasActiveItem,
  isOpen,
  onToggle,
  children,
}: CollapsibleNavGroupProps) => {
  const { expanded } = useSidebar();
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      lastItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 320);

    return () => window.clearTimeout(timeoutId);
  }, [isOpen]);

  return (
    <li>
      <List disablePadding>
        {expanded && (
          <ListItem sx={getDesktopRowStyle()}>
            <ListItemButton
              aria-expanded={isOpen}
              onClick={onToggle}
              sx={{
                borderRadius: '12px',
                height: '100%',
                color: hasActiveItem ? 'primary.main' : 'inherit',
                transition: 'color 0.2s ease-in-out',
              }}
            >
              <ListItemIcon sx={{ minWidth: 24, mr: 1 }}>
                <Icon color={hasActiveItem ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText primary={title} />
              {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>
        )}
        <Collapse in={isOpen || !expanded} timeout="auto" unmountOnExit>
          <List disablePadding>
            {children}
            <Box ref={lastItemRef} sx={{ height: 0 }} aria-hidden />
          </List>
        </Collapse>
      </List>
    </li>
  );
};

export default CollapsibleNavGroup;
