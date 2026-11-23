import { Typography, useTheme } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import ResponsiveRow from '@/components/shared/layout/containers/ResponsiveRow';

interface ArticleKeyFactsProps {
  facts: string[];
}

const ArticleKeyFacts = ({ facts }: ArticleKeyFactsProps) => {
  const theme = useTheme();

  return (
    <ResponsiveRow spacing={2} alignItems="stretch" sx={{ width: '100%' }}>
      {facts.map(fact => (
        <Column
          key={fact}
          alignItems="center"
          justifyContent="center"
          sx={{
            flex: 1,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '16px',
            px: 2,
            py: 2.25,
            textAlign: 'center',
          }}
        >
          <Typography
            sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.5 }}
          >
            {fact}
          </Typography>
        </Column>
      ))}
    </ResponsiveRow>
  );
};

export default ArticleKeyFacts;
