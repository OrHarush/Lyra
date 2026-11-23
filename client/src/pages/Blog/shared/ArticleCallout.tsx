import { alpha, Typography, useTheme } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';

const BRAND_PURPLE = '#a78bfa';

interface ArticleCalloutProps {
  title: string;
  paragraphs: string[];
}

const ArticleCallout = ({ title, paragraphs }: ArticleCalloutProps) => {
  const theme = useTheme();

  return (
    <Column
      component="section"
      spacing={1.5}
      sx={{
        borderInlineStart: `3px solid ${BRAND_PURPLE}`,
        backgroundColor: alpha(BRAND_PURPLE, theme.palette.mode === 'dark' ? 0.07 : 0.04),
        borderRadius: '12px',
        px: 2.5,
        py: 2,
      }}
    >
      <Typography component="h2" variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
        {title}
      </Typography>
      {paragraphs.map(paragraph => (
        <Typography
          key={paragraph}
          variant="body1"
          sx={{ color: 'text.secondary', lineHeight: 1.8 }}
        >
          {paragraph}
        </Typography>
      ))}
    </Column>
  );
};

export default ArticleCallout;
