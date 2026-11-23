import { Box, Typography } from '@mui/material';

import { bodyTextSx, getHubCardStyle, headingSx } from '@/pages/PublicCalculators/styles';

interface HubCardProps {
  title: string;
  description: string;
  cta: string;
  href: string;
}

const HubCard = ({ title, description, cta, href }: HubCardProps) => (
  <Box component="a" href={href} sx={getHubCardStyle()}>
    <Typography component="h2" variant="h5" sx={headingSx}>
      {title}
    </Typography>
    <Typography variant="body1" sx={bodyTextSx}>
      {description}
    </Typography>
    <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, mt: 'auto' }}>
      {cta}
    </Typography>
  </Box>
);

export default HubCard;
