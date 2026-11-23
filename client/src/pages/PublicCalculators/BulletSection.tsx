import { Typography } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import { bodyTextSx, getProseStyle, headingSx } from '@/pages/PublicCalculators/styles';

interface BulletSectionProps {
  heading: string;
  items: string[];
}

const BulletSection = ({ heading, items }: BulletSectionProps) => (
  <Column component="section" spacing={1.5} sx={getProseStyle()}>
    <Typography component="h2" variant="h5" sx={headingSx}>
      {heading}
    </Typography>
    <Column component="ul" spacing={0.75} sx={{ m: 0, paddingInlineStart: 3 }}>
      {items.map(item => (
        <Typography key={item} component="li" variant="body1" sx={bodyTextSx}>
          {item}
        </Typography>
      ))}
    </Column>
  </Column>
);

export default BulletSection;
