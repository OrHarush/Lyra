import { getLatestRates } from './rates';
import {
  ChildAgeBracket,
  DegreeType,
  ImmigrationPeriod,
  IsraelTaxRates,
  ServiceType,
  Sex,
} from './rates/types';

export type { ChildAgeBracket, DegreeType, ImmigrationPeriod, ServiceType, Sex };

export interface CreditPointsInput {
  sex: Sex;
  childAgeBrackets: ChildAgeBracket[];
  isSingleParent: boolean;
  disabledChildrenCount: number;
  serviceType: ServiceType;
  immigrationPeriod: ImmigrationPeriod;
  degreeType: DegreeType;
  degreeGraduationYear: number;
  reserveDays: number;
  manualPoints: number;
}

export const calculateCreditPoints = (
  input: CreditPointsInput,
  rates: IsraelTaxRates = getLatestRates()
): number => {
  const points = rates.creditPoints;

  return (
    points.base[input.sex] +
    sumChildPoints(input.childAgeBrackets, input.sex, rates) +
    (input.isSingleParent ? points.singleParent : 0) +
    Math.max(Math.floor(input.disabledChildrenCount), 0) * points.disabledChild +
    points.service[input.serviceType] +
    points.immigration[input.immigrationPeriod] +
    calculateDegreePoints(input.degreeType, input.degreeGraduationYear, rates) +
    calculateReserveCreditPoints(input.reserveDays, rates) +
    input.manualPoints
  );
};

export const getChildCreditPoints = (
  bracket: ChildAgeBracket,
  sex: Sex,
  rates: IsraelTaxRates = getLatestRates()
): number => rates.creditPoints.child[bracket][sex];

export const calculateReserveCreditPoints = (
  reserveDays: number,
  rates: IsraelTaxRates = getLatestRates()
): number => {
  const { tiers, extraDaysStep, extraPointsPerStep, maxPoints } = rates.creditPoints.reserve;
  const days = Math.floor(reserveDays);
  const lastTier = tiers[tiers.length - 1];

  if (days < tiers[0].fromDays) {
    return 0;
  }

  if (days < lastTier.fromDays) {
    return [...tiers].reverse().find(tier => days >= tier.fromDays)?.points ?? 0;
  }

  const extraSteps = Math.floor((days - lastTier.fromDays) / extraDaysStep);

  return Math.min(lastTier.points + extraSteps * extraPointsPerStep, maxPoints);
};

// Points are earned per tax year, starting the year after graduation. Graduates from 2023 get them
// for several years; earlier graduates (from 2014) get one year's worth, claimed in either of the
// first years after graduating.
export const calculateDegreePoints = (
  degreeType: DegreeType,
  graduationYear: number,
  rates: IsraelTaxRates = getLatestRates()
): number => {
  if (degreeType === 'none' || !Number.isFinite(graduationYear)) {
    return 0;
  }

  const { degree } = rates.creditPoints;
  const rule = degree[degreeType];
  const yearsSinceGraduation = rates.ratesYear - Math.floor(graduationYear);

  if (yearsSinceGraduation < 1) {
    return 0;
  }

  if (graduationYear >= degree.currentRuleFromGraduationYear) {
    return yearsSinceGraduation <= rule.maxYears ? rule.pointsPerYear : 0;
  }

  if (graduationYear >= degree.legacyRuleFromGraduationYear) {
    return yearsSinceGraduation <= degree.legacyClaimWindowYears ? rule.pointsPerYear : 0;
  }

  return 0;
};

export const getDefaultGraduationYear = (
  degreeType: DegreeType,
  rates: IsraelTaxRates = getLatestRates()
): number => (degreeType === 'none' ? 0 : rates.ratesYear - 1);

const sumChildPoints = (brackets: ChildAgeBracket[], sex: Sex, rates: IsraelTaxRates): number =>
  brackets.reduce((total, bracket) => total + getChildCreditPoints(bracket, sex, rates), 0);
