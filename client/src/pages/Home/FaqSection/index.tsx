import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import { ROUTES } from '@/constants/Routes';
import FaqAccordion from '@/pages/Home/FaqSection/FaqAccordion';
import FaqJsonLd from '@/pages/Home/FaqSection/FaqJsonLd';
import Header from '@/pages/Home/FaqSection/Header';

const FAQ_ITEM_KEYS = [
  'free',
  'security',
  'noBank',
  'vsRiseUp',
  'billingCycle',
  'import',
  'mobile',
  'calculators',
  'couples',
] as const;

const READ_MORE_HREFS: Partial<Record<(typeof FAQ_ITEM_KEYS)[number], string>> = {
  vsRiseUp: ROUTES.BLOG_RISEUP_REVIEW_URL,
  calculators: ROUTES.CALCULATORS_URL,
};

const FaqSection = () => {
  const { t } = useTranslation('home');
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px 0px' });

  const items = FAQ_ITEM_KEYS.map(key => ({
    q: t(`landing.faq.items.${key}.q`),
    a: t(`landing.faq.items.${key}.a`),
    readMore: READ_MORE_HREFS[key]
      ? {
          prefix: t(`landing.faq.items.${key}.readMore.prefix`),
          linkText: t(`landing.faq.items.${key}.readMore.linkText`),
          suffix: t(`landing.faq.items.${key}.readMore.suffix`),
          href: READ_MORE_HREFS[key],
        }
      : undefined,
  }));

  return (
    <Column
      component="section"
      id="faq"
      ref={sectionRef}
      alignItems="center"
      sx={{
        px: { xs: 2, md: 4 },
        py: { xs: 8, md: 12 },
        scrollMarginTop: '80px',
      }}
    >
      <Column sx={{ width: '100%', maxWidth: 720 }} spacing={1.5}>
        <Header isInView={isInView} />
        {items.map((item, index) => (
          <FaqAccordion
            key={FAQ_ITEM_KEYS[index]}
            question={item.q}
            answer={item.a}
            readMore={item.readMore}
          />
        ))}
      </Column>
      <FaqJsonLd items={items} />
    </Column>
  );
};

export default FaqSection;
