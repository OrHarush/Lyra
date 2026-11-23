import {
  calculateCompoundInterest,
  COMPOUND_INTEREST_DEFAULTS,
  getLatestRates,
  toCompoundInterestInput,
} from '@lyra/shared';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import JsonLd from '@/components/seo/JsonLd';
import PageSeo from '@/components/seo/PageSeo';
import { ROUTES } from '@/constants/Routes';
import { SITE_URL } from '@/constants/Site';
import CompoundInterestCalculator from '@/pages/Calculators/CompoundInterest';
import AssumptionsTable from '@/pages/PublicCalculators/AssumptionsTable';
import Breadcrumbs from '@/pages/PublicCalculators/Breadcrumbs';
import {
  buildCalculatorSchemas,
  FaqItem,
} from '@/pages/PublicCalculators/buildCalculatorSchemas';
import BulletSection from '@/pages/PublicCalculators/BulletSection';
import CalculatorEmbed from '@/pages/PublicCalculators/CalculatorEmbed';
import CalculatorFaq from '@/pages/PublicCalculators/CalculatorFaq';
import CalculatorIntro from '@/pages/PublicCalculators/CalculatorIntro';
import OtherCalculatorLink from '@/pages/PublicCalculators/OtherCalculatorLink';
import ProseSection from '@/pages/PublicCalculators/ProseSection';
import PublicCalculatorShell from '@/pages/PublicCalculators/PublicCalculatorShell';
import SignupCta from '@/pages/PublicCalculators/SignupCta';
import { getProseStyle, headingSx } from '@/pages/PublicCalculators/styles';
import { formatCurrency } from '@/utils/currency';

const PATH = ROUTES.CALCULATORS_COMPOUND_INTEREST_URL;

const money = (value: number) => formatCurrency(Math.round(value), 'ILS');

const CompoundInterestPublicPage = () => {
  const { t, i18n } = useTranslation('publicCalculators');

  const input = toCompoundInterestInput(COMPOUND_INTEREST_DEFAULTS);
  const result = calculateCompoundInterest(input);

  const exampleValues = {
    initial: money(input.initialAmount),
    monthly: money(input.monthlyDeposit),
    returnPct: input.annualReturnPct,
    feePct: input.annualFeePct,
    years: input.years,
    final: money(result.finalBalance),
    deposited: money(result.totalDeposited),
    interest: money(result.totalInterest),
  };

  const faqItems = t('compoundInterest.faq', { returnObjects: true }) as unknown as FaqItem[];
  const howParagraphs = t('compoundInterest.how', { returnObjects: true }) as unknown as string[];
  const notIncluded = t('compoundInterest.notIncluded', {
    returnObjects: true,
  }) as unknown as string[];

  const title = t('compoundInterest.h1');
  const description = t('compoundInterest.seo.description');

  const breadcrumbs = [
    { label: t('common.breadcrumbHome'), path: ROUTES.HOME_URL },
    { label: t('common.breadcrumbCalculators'), path: ROUTES.CALCULATORS_URL },
    { label: t('compoundInterest.breadcrumb'), path: PATH },
  ];

  const schemas = buildCalculatorSchemas({
    path: PATH,
    name: title,
    description,
    language: i18n.language,
    breadcrumbs,
    faqItems,
  });

  return (
    <>
      <PageSeo
        title={t('compoundInterest.seo.title')}
        description={description}
        canonical={`${SITE_URL}${PATH}`}
        ogType="website"
      />
      <JsonLd id="calc-compound-webpage-jsonld" schema={schemas.webPage} />
      <JsonLd id="calc-compound-breadcrumb-jsonld" schema={schemas.breadcrumbList} />
      <JsonLd id="calc-compound-faq-jsonld" schema={schemas.faqPage} />
      <PublicCalculatorShell>
        <Breadcrumbs items={breadcrumbs} />
        <CalculatorIntro title={title} answer={t('compoundInterest.answer', exampleValues)} />
        <Typography component="h2" variant="h5" sx={{ ...headingSx, ...getProseStyle() }}>
          {t('compoundInterest.calculatorHeading')}
        </Typography>
        <CalculatorEmbed>
          <CompoundInterestCalculator showYearlyTable />
        </CalculatorEmbed>
        <ProseSection heading={t('common.howTitle')} paragraphs={howParagraphs} />
        <AssumptionsTable />
        <ProseSection
          heading={t('common.exampleTitle')}
          paragraphs={[t('compoundInterest.example', exampleValues)]}
        />
        <BulletSection heading={t('common.notIncludedTitle')} items={notIncluded} />
        <CalculatorFaq items={faqItems} />
        <OtherCalculatorLink
          title={t('hub.cards.netSalary.title', { year: getLatestRates().ratesYear })}
          description={t('hub.cards.netSalary.description')}
          href={ROUTES.CALCULATORS_NET_SALARY_URL}
        />
        <SignupCta />
      </PublicCalculatorShell>
    </>
  );
};

export default CompoundInterestPublicPage;
