import { IsraelTaxRates } from './types';

// Sources marked isOfficial: false are secondary summaries; see each entry before relying on a value.
export const ISRAEL_TAX_RATES_2026: IsraelTaxRates = {
  ratesYear: 2026,
  effectiveFrom: '2026-01-01',
  effectiveTo: '2026-12-31',
  verifiedOn: '2026-11-24',
  sources: [
    {
      field: 'incomeTaxBrackets',
      label: 'לוח עזר לחישוב מס הכנסה ממשכורת (קפיטקס)',
      url: 'https://www.capitax.co.il/Attachments/15042026.pdf',
      isOfficial: false,
    },
    {
      field: 'nationalInsurance',
      label: 'ביטוח לאומי: דמי ביטוח לשכירים',
      url: 'https://www.btl.gov.il/INSURANCE/RATES/Pages/לעובדים%20שכירים.aspx',
      isOfficial: true,
    },
    {
      field: 'degree',
      label: 'רשות המסים: זיכוי במס לבעלי תואר אקדמי (טופס 119)',
      url: 'https://www.gov.il/he/service/itc119',
      isOfficial: true,
    },
    {
      field: 'immigration',
      label: 'כל זכות: נקודות זיכוי לעולה חדש',
      url: 'https://www.kolzchut.org.il/he/נקודות_זיכוי_ממס_הכנסה_לעולה_חדש',
      isOfficial: false,
    },
    {
      field: 'children',
      label: 'כל זכות: נקודות זיכוי להורים לילדים בגיל 6–17',
      url: 'https://www.kolzchut.org.il/he/נקודות_זיכוי_ממס_הכנסה_להורים_לילדים_בגיל_12-6',
      isOfficial: false,
    },
    {
      field: 'studyFund',
      label: 'תקרות וסכומים 2026 (מור השקעות)',
      url: 'https://www.moreinvest.co.il/media/ob5nzn0o/תקרות-וסכומים-2026.pdf',
      isOfficial: false,
    },
  ],
  incomeTaxBrackets: [
    { upTo: 7_010, rate: 0.1 },
    { upTo: 10_060, rate: 0.14 },
    { upTo: 19_000, rate: 0.2 },
    { upTo: 25_100, rate: 0.31 },
    { upTo: 46_690, rate: 0.35 },
    { upTo: 60_130, rate: 0.47 },
    { upTo: Infinity, rate: 0.5 },
  ],
  creditPointValue: 242,
  creditPoints: {
    base: { male: 2.25, female: 2.75 },
    child: {
      birthYear: { male: 2.5, female: 2.5 },
      age1to2: { male: 4.5, female: 4.5 },
      age3: { male: 3.5, female: 3.5 },
      age4to5: { male: 2.5, female: 2.5 },
      age6to17: { male: 1, female: 2 },
      age18: { male: 0, female: 0.5 },
    },
    singleParent: 1,
    disabledChild: 2,
    service: { none: 0, full: 2, short: 1 },
    immigration: {
      none: 0,
      first12Months: 1,
      next18Months: 3,
      next12Months: 2,
      last12Months: 1,
    },
    degree: {
      bachelor: { pointsPerYear: 1, maxYears: 3 },
      master: { pointsPerYear: 0.5, maxYears: 2 },
      currentRuleFromGraduationYear: 2023,
      legacyRuleFromGraduationYear: 2014,
      legacyClaimWindowYears: 2,
    },
    reserve: {
      tiers: [
        { fromDays: 30, points: 0.5 },
        { fromDays: 40, points: 0.75 },
        { fromDays: 50, points: 1 },
      ],
      extraDaysStep: 5,
      extraPointsPerStep: 0.25,
      maxPoints: 4,
    },
  },
  donationTaxCreditRate: 0.35,
  pensionTaxCredit: { rate: 0.35, maxSalaryShare: 0.07, monthlyCap: 679 },
  nationalInsurance: {
    reducedBandCeiling: 7_703,
    maxInsurableIncome: 51_910,
    reducedRate: 0.0427,
    fullRate: 0.1217,
  },
  studyFund: { salaryCeiling: 15_712, employeeRate: 0.025, employerRate: 0.075 },
  pensionDefaults: {
    employeeRate: 0.06,
    employerRate: 0.065,
    severanceRate: { regular: 0.06, section14: 0.0833 },
  },
};
