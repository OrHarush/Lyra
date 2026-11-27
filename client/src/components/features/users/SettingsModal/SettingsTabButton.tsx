import { SvgIconComponent } from '@mui/icons-material';
import { ListItemButton, Typography } from '@mui/material';

import { getSettingsTabButtonStyle } from '@/components/features/users/SettingsModal/styles';

interface SettingsTabButtonProps {
  icon: SvgIconComponent;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const SettingsTabButton = ({ icon: Icon, label, isActive, onClick }: SettingsTabButtonProps) => (
  <ListItemButton onClick={onClick} sx={getSettingsTabButtonStyle(isActive)}>
    <Icon fontSize="small" color={isActive ? 'primary' : 'inherit'} />
    <Typography variant="body2" fontWeight={isActive ? 600 : 500}>
      {label}
    </Typography>
  </ListItemButton>
);

export default SettingsTabButton;
