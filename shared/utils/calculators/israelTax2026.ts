// 2026 values were compiled from public summaries and not verified against an official
// Tax Authority / Bituach Leumi publication — confirm against a real payslip before relying on them.

export interface TaxBracket {
  upTo: number;
  rate: number;
}

export const INCOME_TAX_BRACKETS_2026: TaxBracket[] = [
  { upTo: 7_010, rate: 0.1 },
  { upTo: 10_060, rate: 0.14 },
  { upTo: 19_000, rate: 0.2 },
  { upTo: 25_100, rate: 0.31 },
  { upTo: 46_690, rate: 0.35 },
  { upTo: 60_130, rate: 0.47 },
  { upTo: Infinity, rate: 0.5 },
];

export const CREDIT_POINT_VALUE_2026 = 242;

export const BASE_CREDIT_POINTS = {
  male: 2.25,
  female: 2.75,
} as const;

export type ChildAgeBracket =
  | 'birthYear'
  | 'age1to2'
  | 'age3'
  | 'age4to5'
  | 'age6to17'
  | 'age18';

export const CHILD_CREDIT_POINTS: Record<ChildAgeBracket, { male: number; female: number }> = {
  birthYear: { male: 2.5, female: 2.5 },
  age1to2: { male: 4.5, female: 4.5 },
  age3: { male: 3.5, female: 3.5 },
  age4to5: { male: 2.5, female: 2.5 },
  age6to17: { male: 1, female: 2 },
  age18: { male: 0, female: 0.5 },
};

export const SINGLE_PARENT_CREDIT_POINTS = 1;
export const DISABLED_CHILD_CREDIT_POINTS = 2;

export const SERVICE_CREDIT_POINTS = {
  none: 0,
  full: 2,
  short: 1,
} as const;

export const IMMIGRATION_CREDIT_POINTS = {
  none: 0,
  first18Months: 3,
  next12Months: 2,
  last12Months: 1,
} as const;

export const DEGREE_CREDIT_POINTS = {
  none: { pointsPerYear: 0, maxYears: 0 },
  bachelor: { pointsPerYear: 1, maxYears: 3 },
  master: { pointsPerYear: 0.5, maxYears: 2 },
} as const;

export const RESERVE_CREDIT_POINTS = {
  tiers: [
    { fromDays: 30, points: 0.5 },
    { fromDays: 40, points: 0.75 },
    { fromDays: 50, points: 1 },
  ],
  extraDaysStep: 5,
  extraPointsPerStep: 0.25,
  maxPoints: 4,
};

export const DONATION_TAX_CREDIT_RATE = 0.35;

export const PENSION_TAX_CREDIT_2026 = {
  rate: 0.35,
  maxSalaryShare: 0.07,
  monthlyCap: 679,
};

export const NATIONAL_INSURANCE_2026 = {
  reducedBandCeiling: 7_703,
  maxInsurableIncome: 51_910,
  reducedRate: 0.0427,
  fullRate: 0.1217,
};

export const STUDY_FUND_2026 = {
  salaryCeiling: 15_712,
  employeeRate: 0.025,
  employerRate: 0.075,
};

export const PENSION_DEFAULTS = {
  employeeRate: 0.06,
  employerRate: 0.065,
  severanceRate: {
    regular: 0.06,
    section14: 0.0833,
  },
} as const;
