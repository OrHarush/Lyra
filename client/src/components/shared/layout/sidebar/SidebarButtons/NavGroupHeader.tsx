import { Typography } from '@mui/material';

import { getDesktopHeaderStyle } from '@/components/shared/layout/sidebar/SidebarButtons/styles';

const NavGroupHeader = ({ title }: { title: string }) => (
  <Typography
    component="li"
    variant="caption"
    fontWeight={600}
    color="text.secondary"
    noWrap
    sx={getDesktopHeaderStyle()}
  >
    {title}
  </Typography>
);

export default NavGroupHeader;
