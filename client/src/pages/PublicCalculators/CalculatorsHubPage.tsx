import { getLatestRates } from '@lyra/shared';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import JsonLd from '@/components/seo/JsonLd';
import PageSeo from '@/components/seo/PageSeo';
import Column from '@/components/shared/layout/containers/Column';
import ResponsiveRow from '@/components/shared/layout/containers/ResponsiveRow';
import { ROUTES } from '@/constants/Routes';
import { SITE_URL } from '@/constants/Site';
import Breadcrumbs from '@/pages/PublicCalculators/Breadcrumbs';
import { buildCalculatorSchemas } from '@/pages/PublicCalculators/buildCalculatorSchemas';
import CalculatorIntro from '@/pages/PublicCalculators/CalculatorIntro';
import HubCard from '@/pages/PublicCalculators/HubCard';
import PublicCalculatorShell from '@/pages/PublicCalculators/PublicCalculatorShell';
import SignupCta from '@/pages/PublicCalculators/SignupCta';
import { bodyTextSx, getProseStyle } from '@/pages/PublicCalculators/styles';

const PATH = ROUTES.CALCULATORS_URL;

const CalculatorsHubPage = () => {
  const { t, i18n } = useTranslation('publicCalculators');
  const { ratesYear } = getLatestRates();

  const title = t('hub.h1');
  const description = t('hub.seo.description', { year: ratesYear });

  const breadcrumbs = [
    { label: t('common.breadcrumbHome'), path: ROUTES.HOME_URL },
    { label: t('common.breadcrumbCalculators'), path: PATH },
  ];

  const schemas = buildCalculatorSchemas({
    path: PATH,
    name: title,
    description,
    language: i18n.language,
    breadcrumbs,
    faqItems: [],
  });

  return (
    <>
      <PageSeo
        title={t('hub.seo.title')}
        description={description}
        canonical={`${SITE_URL}${PATH}`}
        ogType="website"
      />
      <JsonLd id="calc-hub-webpage-jsonld" schema={schemas.webPage} />
      <JsonLd id="calc-hub-breadcrumb-jsonld" schema={schemas.breadcrumbList} />
      <PublicCalculatorShell>
        <Breadcrumbs items={breadcrumbs} />
        <CalculatorIntro title={title} answer={t('hub.intro', { year: ratesYear })} />
        <ResponsiveRow spacing={2} sx={{ alignItems: 'stretch' }}>
          <HubCard
            title={t('hub.cards.netSalary.title', { year: ratesYear })}
            description={t('hub.cards.netSalary.description')}
            cta={t('hub.cards.netSalary.cta')}
            href={ROUTES.CALCULATORS_NET_SALARY_URL}
          />
          <HubCard
            title={t('hub.cards.compoundInterest.title')}
            description={t('hub.cards.compoundInterest.description')}
            cta={t('hub.cards.compoundInterest.cta')}
            href={ROUTES.CALCULATORS_COMPOUND_INTEREST_URL}
          />
        </ResponsiveRow>
        <Column sx={getProseStyle()}>
          <Typography variant="caption" sx={bodyTextSx}>
            {t('hub.note')}
          </Typography>
        </Column>
        <SignupCta />
      </PublicCalculatorShell>
    </>
  );
};

export default CalculatorsHubPage;
