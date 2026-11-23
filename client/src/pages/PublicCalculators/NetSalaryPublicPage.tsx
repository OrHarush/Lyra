import {
  calculateNetSalaryFromForm,
  getLatestRates,
  NET_SALARY_DEFAULTS,
  toPercent,
} from '@lyra/shared';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import JsonLd from '@/components/seo/JsonLd';
import PageSeo from '@/components/seo/PageSeo';
import { ROUTES } from '@/constants/Routes';
import { SITE_URL } from '@/constants/Site';
import OutdatedRatesNotice from '@/pages/Calculators/components/OutdatedRatesNotice';
import NetSalaryCalculator from '@/pages/Calculators/NetSalary';
import Breadcrumbs from '@/pages/PublicCalculators/Breadcrumbs';
import {
  buildCalculatorSchemas,
  FaqItem,
} from '@/pages/PublicCalculators/buildCalculatorSchemas';
import BulletSection from '@/pages/PublicCalculators/BulletSection';
import CalculatorEmbed from '@/pages/PublicCalculators/CalculatorEmbed';
import CalculatorFaq from '@/pages/PublicCalculators/CalculatorFaq';
import CalculatorIntro from '@/pages/PublicCalculators/CalculatorIntro';
import { formatIsoDate } from '@/pages/PublicCalculators/formatIsoDate';
import OtherCalculatorLink from '@/pages/PublicCalculators/OtherCalculatorLink';
import ProseSection from '@/pages/PublicCalculators/ProseSection';
import PublicCalculatorShell from '@/pages/PublicCalculators/PublicCalculatorShell';
import RatesTable from '@/pages/PublicCalculators/RatesTable';
import SignupCta from '@/pages/PublicCalculators/SignupCta';
import SourcesList from '@/pages/PublicCalculators/SourcesList';
import { getProseStyle, headingSx } from '@/pages/PublicCalculators/styles';
import { formatCurrency } from '@/utils/currency';

const PATH = ROUTES.CALCULATORS_NET_SALARY_URL;

const money = (value: number) => formatCurrency(Math.round(value), 'ILS');

const NetSalaryPublicPage = () => {
  const { t, i18n } = useTranslation('publicCalculators');
  const rates = getLatestRates();
  const { ratesYear, verifiedOn } = rates;

  const { creditPoints, breakdown } = calculateNetSalaryFromForm(NET_SALARY_DEFAULTS, rates);
  const ratesLabel = t('common.ratesAsOf', { year: ratesYear, verifiedOn: formatIsoDate(verifiedOn) });

  const exampleValues = {
    gross: money(breakdown.grossSalary),
    points: creditPoints,
    pension: toPercent(rates.pensionDefaults.employeeRate),
    fundEmployee: toPercent(rates.studyFund.employeeRate),
    pensionAmount: money(breakdown.employeePension),
    fundAmount: money(breakdown.employeeStudyFund),
    ni: money(breakdown.nationalInsurance),
    tax: money(breakdown.incomeTax),
    net: money(breakdown.netSalary),
  };

  const faqItems = t('netSalary.faq', {
    returnObjects: true,
    male: rates.creditPoints.base.male,
    female: rates.creditPoints.base.female,
  }) as unknown as FaqItem[];
  const howParagraphs = t('netSalary.how', {
    returnObjects: true,
    pointValue: money(rates.creditPointValue),
    pensionCreditPct: toPercent(rates.pensionTaxCredit.rate),
  }) as unknown as string[];
  const notIncluded = t('netSalary.notIncluded', { returnObjects: true }) as unknown as string[];

  const title = t('netSalary.h1', { year: ratesYear });
  const description = t('netSalary.seo.description', { year: ratesYear });

  const breadcrumbs = [
    { label: t('common.breadcrumbHome'), path: ROUTES.HOME_URL },
    { label: t('common.breadcrumbCalculators'), path: ROUTES.CALCULATORS_URL },
    { label: t('netSalary.breadcrumb'), path: PATH },
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
        title={t('netSalary.seo.title', { year: ratesYear })}
        description={description}
        canonical={`${SITE_URL}${PATH}`}
        ogType="website"
      />
      <JsonLd id="calc-net-salary-webpage-jsonld" schema={schemas.webPage} />
      <JsonLd id="calc-net-salary-breadcrumb-jsonld" schema={schemas.breadcrumbList} />
      <JsonLd id="calc-net-salary-faq-jsonld" schema={schemas.faqPage} />
      <PublicCalculatorShell>
        <Breadcrumbs items={breadcrumbs} />
        <CalculatorIntro
          title={title}
          ratesLabel={ratesLabel}
          answer={t('netSalary.answer', exampleValues)}
        />
        <OutdatedRatesNotice />
        <Typography component="h2" variant="h5" sx={{ ...headingSx, ...getProseStyle() }}>
          {t('netSalary.calculatorHeading')}
        </Typography>
        <CalculatorEmbed hasFixedHeight>
          <NetSalaryCalculator />
        </CalculatorEmbed>
        <ProseSection heading={t('common.howTitle')} paragraphs={howParagraphs} />
        <RatesTable rates={rates} ratesLabel={ratesLabel} />
        <ProseSection
          heading={t('common.exampleTitle')}
          paragraphs={[t('netSalary.example', exampleValues)]}
        />
        <BulletSection heading={t('common.notIncludedTitle')} items={notIncluded} />
        <SourcesList sources={rates.sources} ratesLabel={ratesLabel} />
        <CalculatorFaq items={faqItems} />
        <OtherCalculatorLink
          title={t('hub.cards.compoundInterest.title')}
          description={t('hub.cards.compoundInterest.description')}
          href={ROUTES.CALCULATORS_COMPOUND_INTEREST_URL}
        />
        <SignupCta />
      </PublicCalculatorShell>
    </>
  );
};

export default NetSalaryPublicPage;
