import { Typography } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import { bodyTextSx, getProseStyle, headingSx } from '@/pages/PublicCalculators/styles';

interface ProseSectionProps {
  heading: string;
  paragraphs: string[];
}

const ProseSection = ({ heading, paragraphs }: ProseSectionProps) => (
  <Column component="section" spacing={1.5} sx={getProseStyle()}>
    <Typography component="h2" variant="h5" sx={headingSx}>
      {heading}
    </Typography>
    {paragraphs.map(paragraph => (
      <Typography key={paragraph} variant="body1" sx={bodyTextSx}>
        {paragraph}
      </Typography>
    ))}
  </Column>
);

export default ProseSection;
