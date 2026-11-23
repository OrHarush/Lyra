import { calculateCreditPoints, CreditPointsInput, getDefaultGraduationYear } from './creditPoints';
import { calculateNetSalary, NetSalaryBreakdown, NetSalaryInput } from './netSalary';
import { getLatestRates } from './rates';
import {
  ChildAgeBracket,
  DegreeType,
  ImmigrationPeriod,
  ServiceType,
  SeveranceTrack,
  IsraelTaxRates,
  Sex,
} from './rates/types';

export interface ChildFormValue {
  bracket: ChildAgeBracket;
}

export interface NetSalaryFormValues {
  grossSalary: number | null;
  sex: Sex;
  childAges: ChildFormValue[];
  isSingleParent: boolean;
  disabledChildrenCount: number | null;
  serviceType: ServiceType;
  immigrationPeriod: ImmigrationPeriod;
  degreeType: DegreeType;
  degreeGraduationYear: number | null;
  reserveDays: number | null;
  manualCreditPoints: number | null;
  hasStudyFund: boolean;
  studyFundEmployeePct: number | null;
  studyFundEmployerPct: number | null;
  studyFundInsuredSharePct: number | null;
  employeePensionPct: number | null;
  employerPensionPct: number | null;
  severanceTrack: SeveranceTrack;
  annualDonations: number | null;
}

export type NetSalaryWatchedValues = {
  [Key in keyof NetSalaryFormValues]?: NetSalaryFormValues[Key] extends (infer Item)[]
    ? (Partial<Item> | undefined)[]
    : NetSalaryFormValues[Key];
};

const buildDefaults = (): NetSalaryFormValues => {
  const { studyFund, pensionDefaults } = getLatestRates();

  return {
    grossSalary: 15_000,
    sex: 'male',
    childAges: [],
    isSingleParent: false,
    disabledChildrenCount: 0,
    serviceType: 'none',
    immigrationPeriod: 'none',
    degreeType: 'none',
    degreeGraduationYear: 0,
    reserveDays: 0,
    manualCreditPoints: 0,
    hasStudyFund: true,
    studyFundEmployeePct: toPercent(studyFund.employeeRate),
    studyFundEmployerPct: toPercent(studyFund.employerRate),
    studyFundInsuredSharePct: 100,
    employeePensionPct: toPercent(pensionDefaults.employeeRate),
    employerPensionPct: toPercent(pensionDefaults.employerRate),
    severanceTrack: 'regular',
    annualDonations: 0,
  };
};

export const toPercent = (rate: number): number => Number((rate * 100).toFixed(2));

export const toRate = (percent: number | null | undefined): number =>
  Math.min(Math.max(percent ?? 0, 0), 100) / 100;

export const NET_SALARY_DEFAULTS: NetSalaryFormValues = buildDefaults();

export const getGraduationYearDefault = (degreeType: DegreeType): number =>
  getDefaultGraduationYear(degreeType);

export const toCreditPointsInput = (values: NetSalaryWatchedValues): CreditPointsInput => ({
  sex: values.sex ?? NET_SALARY_DEFAULTS.sex,
  childAgeBrackets: (values.childAges ?? []).flatMap(child => (child?.bracket ? [child.bracket] : [])),
  isSingleParent: values.isSingleParent ?? false,
  disabledChildrenCount: values.disabledChildrenCount ?? 0,
  serviceType: values.serviceType ?? NET_SALARY_DEFAULTS.serviceType,
  immigrationPeriod: values.immigrationPeriod ?? NET_SALARY_DEFAULTS.immigrationPeriod,
  degreeType: values.degreeType ?? NET_SALARY_DEFAULTS.degreeType,
  degreeGraduationYear: values.degreeGraduationYear ?? 0,
  reserveDays: values.reserveDays ?? 0,
  manualPoints: values.manualCreditPoints ?? 0,
});

export const toNetSalaryInput = (
  values: NetSalaryWatchedValues,
  creditPoints: number
): NetSalaryInput => ({
  grossSalary: values.grossSalary ?? 0,
  creditPoints,
  employeePensionRate: toRate(values.employeePensionPct),
  employerPensionRate: toRate(values.employerPensionPct),
  severanceTrack: values.severanceTrack ?? NET_SALARY_DEFAULTS.severanceTrack,
  studyFund: {
    isEnabled: values.hasStudyFund ?? false,
    employeeRate: toRate(values.studyFundEmployeePct),
    employerRate: toRate(values.studyFundEmployerPct),
    insuredSalaryShare: toRate(values.studyFundInsuredSharePct),
  },
  annualDonations: values.annualDonations ?? 0,
});

export interface NetSalaryFormResult {
  creditPoints: number;
  input: NetSalaryInput;
  breakdown: NetSalaryBreakdown;
}

export const calculateNetSalaryFromForm = (
  values: NetSalaryWatchedValues,
  rates: IsraelTaxRates = getLatestRates()
): NetSalaryFormResult => {
  const creditPoints = calculateCreditPoints(toCreditPointsInput(values), rates);
  const input = toNetSalaryInput(values, creditPoints);

  return { creditPoints, input, breakdown: calculateNetSalary(input, rates) };
};
