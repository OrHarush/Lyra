import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Collapse, List, ListItemButton, Typography } from '@mui/material';
import { ReactNode } from 'react';

import {
  getSidebarSectionArrowStyle,
  getSidebarSubtitleStyle,
} from '@/components/shared/layout/sidebar/SidebarButtons/styles';

interface SidebarSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

const SidebarSection = ({ title, isExpanded, onToggle, children }: SidebarSectionProps) => (
  <li>
    <ListItemButton aria-expanded={isExpanded} onClick={onToggle} sx={getSidebarSubtitleStyle()}>
      <Typography variant="caption" fontWeight={600} color="text.secondary">
        {title}
      </Typography>
      <ExpandMoreIcon sx={getSidebarSectionArrowStyle(isExpanded)} />
    </ListItemButton>
    <Collapse in={isExpanded} unmountOnExit>
      <List disablePadding>{children}</List>
    </Collapse>
  </li>
);

export default SidebarSection;
