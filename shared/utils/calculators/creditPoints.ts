import {
  BASE_CREDIT_POINTS,
  CHILD_CREDIT_POINTS,
  ChildAgeBracket,
  DEGREE_CREDIT_POINTS,
  DISABLED_CHILD_CREDIT_POINTS,
  IMMIGRATION_CREDIT_POINTS,
  RESERVE_CREDIT_POINTS,
  SERVICE_CREDIT_POINTS,
  SINGLE_PARENT_CREDIT_POINTS,
} from './israelTax2026';

export type Sex = keyof typeof BASE_CREDIT_POINTS;
export type ServiceType = keyof typeof SERVICE_CREDIT_POINTS;
export type ImmigrationPeriod = keyof typeof IMMIGRATION_CREDIT_POINTS;
export type DegreeType = keyof typeof DEGREE_CREDIT_POINTS;

export interface CreditPointsInput {
  sex: Sex;
  childAgeBrackets: ChildAgeBracket[];
  isSingleParent: boolean;
  disabledChildrenCount: number;
  serviceType: ServiceType;
  immigrationPeriod: ImmigrationPeriod;
  degreeType: DegreeType;
  degreeYears: number;
  reserveDays: number;
  manualPoints: number;
}

export const calculateCreditPoints = (input: CreditPointsInput): number =>
  BASE_CREDIT_POINTS[input.sex] +
  sumChildPoints(input.childAgeBrackets, input.sex) +
  (input.isSingleParent ? SINGLE_PARENT_CREDIT_POINTS : 0) +
  Math.max(Math.floor(input.disabledChildrenCount), 0) * DISABLED_CHILD_CREDIT_POINTS +
  SERVICE_CREDIT_POINTS[input.serviceType] +
  IMMIGRATION_CREDIT_POINTS[input.immigrationPeriod] +
  calculateDegreePoints(input.degreeType, input.degreeYears) +
  calculateReserveCreditPoints(input.reserveDays) +
  input.manualPoints;

export const getChildCreditPoints = (bracket: ChildAgeBracket, sex: Sex): number =>
  CHILD_CREDIT_POINTS[bracket][sex];

export const calculateReserveCreditPoints = (reserveDays: number): number => {
  const { tiers, extraDaysStep, extraPointsPerStep, maxPoints } = RESERVE_CREDIT_POINTS;
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

const sumChildPoints = (brackets: ChildAgeBracket[], sex: Sex): number =>
  brackets.reduce((total, bracket) => total + getChildCreditPoints(bracket, sex), 0);

const calculateDegreePoints = (degreeType: DegreeType, degreeYears: number): number => {
  const { pointsPerYear, maxYears } = DEGREE_CREDIT_POINTS[degreeType];
  const countedYears = Math.min(Math.max(Math.floor(degreeYears), 0), maxYears);

  return countedYears * pointsPerYear;
};
