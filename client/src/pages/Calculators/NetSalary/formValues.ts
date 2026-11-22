import type {
  ChildAgeBracket,
  CreditPointsInput,
  DegreeType,
  ImmigrationPeriod,
  NetSalaryInput,
  ServiceType,
  SeveranceTrack,
  Sex,
} from '@lyra/shared';
import type { DeepPartial } from 'react-hook-form';

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
  degreeYears: number | null;
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

export const NET_SALARY_DEFAULTS: NetSalaryFormValues = {
  grossSalary: 15_000,
  sex: 'male',
  childAges: [],
  isSingleParent: false,
  disabledChildrenCount: 0,
  serviceType: 'none',
  immigrationPeriod: 'none',
  degreeType: 'none',
  degreeYears: 0,
  reserveDays: 0,
  manualCreditPoints: 0,
  hasStudyFund: true,
  studyFundEmployeePct: 2.5,
  studyFundEmployerPct: 7.5,
  studyFundInsuredSharePct: 100,
  employeePensionPct: 6,
  employerPensionPct: 6.5,
  severanceTrack: 'regular',
  annualDonations: 0,
};

type WatchedValues = DeepPartial<NetSalaryFormValues>;

const toRate = (percent: number | null | undefined): number => (percent ?? 0) / 100;

export const toCreditPointsInput = (values: WatchedValues): CreditPointsInput => ({
  sex: values.sex ?? NET_SALARY_DEFAULTS.sex,
  childAgeBrackets: (values.childAges ?? []).flatMap(child => (child?.bracket ? [child.bracket] : [])),
  isSingleParent: values.isSingleParent ?? false,
  disabledChildrenCount: values.disabledChildrenCount ?? 0,
  serviceType: values.serviceType ?? NET_SALARY_DEFAULTS.serviceType,
  immigrationPeriod: values.immigrationPeriod ?? NET_SALARY_DEFAULTS.immigrationPeriod,
  degreeType: values.degreeType ?? NET_SALARY_DEFAULTS.degreeType,
  degreeYears: values.degreeYears ?? 0,
  reserveDays: values.reserveDays ?? 0,
  manualPoints: values.manualCreditPoints ?? 0,
});

export const toNetSalaryInput = (values: WatchedValues, creditPoints: number): NetSalaryInput => ({
  grossSalary: values.grossSalary ?? 0,
  creditPoints,
  employeePensionRate: toRate(values.employeePensionPct),
  employerPensionRate: toRate(values.employerPensionPct),
  severanceTrack: values.severanceTrack ?? NET_SALARY_DEFAULTS.severanceTrack,
  studyFund: {
    isEnabled: values.hasStudyFund ?? false,
    employeeRate: toRate(values.studyFundEmployeePct),
    employerRate: toRate(values.studyFundEmployerPct),
    insuredSalaryShare: Math.min(toRate(values.studyFundInsuredSharePct), 1),
  },
  annualDonations: values.annualDonations ?? 0,
});
