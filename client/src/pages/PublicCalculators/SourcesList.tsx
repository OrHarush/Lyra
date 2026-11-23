import type { RateSource } from '@lyra/shared';
import { Link, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import { bodyTextSx, getProseStyle, headingSx } from '@/pages/PublicCalculators/styles';

interface SourcesListProps {
  sources: RateSource[];
  ratesLabel: string;
}

const SourcesList = ({ sources, ratesLabel }: SourcesListProps) => {
  const { t } = useTranslation('publicCalculators');

  return (
    <Column component="section" spacing={1.5} sx={getProseStyle()}>
      <Typography component="h2" variant="h5" sx={headingSx}>
        {t('common.sourcesTitle')}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {ratesLabel}
      </Typography>
      <Column component="ul" spacing={0.75} sx={{ m: 0, paddingInlineStart: 3 }}>
        {sources.map(source => (
          <Typography key={source.url} component="li" variant="body2" sx={bodyTextSx}>
            <Link href={source.url} target="_blank" rel="noopener noreferrer">
              {source.label}
            </Link>
            {' · '}
            {source.isOfficial ? t('common.sourceOfficial') : t('common.sourceSecondary')}
          </Typography>
        ))}
      </Column>
      <Typography variant="caption" color="text.secondary">
        {t('common.sourceNote')}
      </Typography>
    </Column>
  );
};

export default SourcesList;
