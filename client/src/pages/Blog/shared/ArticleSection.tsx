import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import ArticleCallout from '@/pages/Blog/shared/ArticleCallout';
import ArticleLink from '@/pages/Blog/shared/ArticleLink';
import ArticleTable from '@/pages/Blog/shared/ArticleTable';
import { ArticleSectionContent } from '@/pages/Blog/shared/types';

const bodyTextSx = { color: 'text.secondary', lineHeight: 1.8 } as const;
const headingSx = { fontWeight: 700, color: 'text.primary' } as const;

interface ArticleListProps {
  items: string[];
  markerFor: (index: number) => string;
}

const ArticleList = ({ items, markerFor }: ArticleListProps) => (
  <Column spacing={1} sx={{ pl: { xs: 1, sm: 2 } }}>
    {items.map((item, index) => (
      <Row key={item} spacing={1} alignItems="flex-start">
        <Typography sx={{ ...bodyTextSx, fontWeight: 700, flexShrink: 0 }}>
          {markerFor(index)}
        </Typography>
        <Typography sx={bodyTextSx}>{item}</Typography>
      </Row>
    ))}
  </Column>
);

interface ArticleSectionProps {
  section: ArticleSectionContent;
}

const ArticleSection = ({ section }: ArticleSectionProps) => {
  const { t } = useTranslation('blog');

  if (section.variant === 'callout') {
    return <ArticleCallout title={section.title} paragraphs={section.paragraphs ?? []} />;
  }

  const isSubsection = section.level === 3;

  return (
    <Column component="section" spacing={1.5}>
      <Typography
        component={isSubsection ? 'h3' : 'h2'}
        variant={isSubsection ? 'h6' : 'h5'}
        sx={headingSx}
      >
        {section.title}
      </Typography>
      {section.paragraphs?.map(paragraph => (
        <Typography key={paragraph} variant="body1" sx={bodyTextSx}>
          {paragraph}
        </Typography>
      ))}
      {section.bullets && <ArticleList items={section.bullets} markerFor={() => '•'} />}
      {section.numbered && (
        <ArticleList items={section.numbered} markerFor={index => `${index + 1}.`} />
      )}
      {section.table && <ArticleTable table={section.table} />}
      {section.after?.map(paragraph => (
        <Typography key={paragraph} variant="body1" sx={bodyTextSx}>
          {paragraph}
        </Typography>
      ))}
      {section.linkRoute && section.linkLabel && (
        <Typography variant="body1" sx={bodyTextSx}>
          {t('alsoRead')} <ArticleLink route={section.linkRoute} label={section.linkLabel} />
        </Typography>
      )}
    </Column>
  );
};

export default ArticleSection;
