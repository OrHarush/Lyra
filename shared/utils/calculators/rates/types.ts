export type Sex = 'male' | 'female';
export type ServiceType = 'none' | 'full' | 'short';
export type ImmigrationPeriod =
  | 'none'
  | 'first12Months'
  | 'next18Months'
  | 'next12Months'
  | 'last12Months';
export type DegreeType = 'none' | 'bachelor' | 'master';
export type SeveranceTrack = 'regular' | 'section14';
export type ChildAgeBracket =
  | 'birthYear'
  | 'age1to2'
  | 'age3'
  | 'age4to5'
  | 'age6to17'
  | 'age18';

export interface TaxBracket {
  upTo: number;
  rate: number;
}

export interface RateSource {
  field: string;
  label: string;
  url: string;
  isOfficial: boolean;
}

interface DegreeRule {
  pointsPerYear: number;
  maxYears: number;
}

export interface IsraelTaxRates {
  ratesYear: number;
  effectiveFrom: string;
  effectiveTo: string;
  verifiedOn: string;
  sources: RateSource[];
  incomeTaxBrackets: TaxBracket[];
  creditPointValue: number;
  creditPoints: {
    base: Record<Sex, number>;
    child: Record<ChildAgeBracket, Record<Sex, number>>;
    singleParent: number;
    disabledChild: number;
    service: Record<ServiceType, number>;
    immigration: Record<ImmigrationPeriod, number>;
    degree: {
      bachelor: DegreeRule;
      master: DegreeRule;
      currentRuleFromGraduationYear: number;
      legacyRuleFromGraduationYear: number;
      legacyClaimWindowYears: number;
    };
    reserve: {
      tiers: { fromDays: number; points: number }[];
      extraDaysStep: number;
      extraPointsPerStep: number;
      maxPoints: number;
    };
  };
  donationTaxCreditRate: number;
  pensionTaxCredit: { rate: number; maxSalaryShare: number; monthlyCap: number };
  nationalInsurance: {
    reducedBandCeiling: number;
    maxInsurableIncome: number;
    reducedRate: number;
    fullRate: number;
  };
  studyFund: { salaryCeiling: number; employeeRate: number; employerRate: number };
  pensionDefaults: {
    employeeRate: number;
    employerRate: number;
    severanceRate: Record<SeveranceTrack, number>;
  };
}
