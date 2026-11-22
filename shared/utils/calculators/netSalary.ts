import { fromCents, toCents } from '../money';
import {
  CREDIT_POINT_VALUE_2026,
  DONATION_TAX_CREDIT_RATE,
  INCOME_TAX_BRACKETS_2026,
  NATIONAL_INSURANCE_2026,
  PENSION_DEFAULTS,
  PENSION_TAX_CREDIT_2026,
  STUDY_FUND_2026,
  TaxBracket,
} from './israelTax2026';

export type SeveranceTrack = keyof typeof PENSION_DEFAULTS.severanceRate;

const MONTHS_IN_YEAR = 12;

export interface StudyFundInput {
  isEnabled: boolean;
  employeeRate: number;
  employerRate: number;
  insuredSalaryShare: number;
}

export interface NetSalaryInput {
  grossSalary: number;
  creditPoints: number;
  employeePensionRate: number;
  employerPensionRate: number;
  severanceTrack: SeveranceTrack;
  studyFund: StudyFundInput;
  annualDonations: number;
}

export interface StudyFundContributions {
  insuredSalary: number;
  employee: number;
  employer: number;
  taxableEmployerBenefit: number;
}

export interface NetSalaryBreakdown {
  grossSalary: number;
  employeePension: number;
  employeeStudyFund: number;
  nationalInsurance: number;
  taxableIncome: number;
  incomeTaxBeforeCredits: number;
  creditPoints: number;
  creditPointsValue: number;
  pensionTaxCredit: number;
  donationsTaxCredit: number;
  incomeTax: number;
  netSalary: number;
  employerPension: number;
  employerSeverance: number;
  employerStudyFund: number;
  studyFundInsuredSalary: number;
  studyFundTaxableBenefit: number;
  employerCost: number;
}

export const calculateNetSalary = (input: NetSalaryInput): NetSalaryBreakdown => {
  const grossSalary = Math.max(input.grossSalary, 0);

  const employeePension = roundMoney(grossSalary * input.employeePensionRate);
  const studyFund = calculateStudyFund(grossSalary, input.studyFund);

  const taxableIncome = grossSalary + studyFund.taxableEmployerBenefit;
  const incomeTaxBeforeCredits = roundMoney(calculateBracketTax(taxableIncome, INCOME_TAX_BRACKETS_2026));
  const creditPoints = Math.max(input.creditPoints, 0);
  const creditPointsValue = roundMoney(creditPoints * CREDIT_POINT_VALUE_2026);
  const pensionTaxCredit = calculatePensionTaxCredit(employeePension, grossSalary);
  const donationsTaxCredit = calculateMonthlyDonationsCredit(input.annualDonations);
  const incomeTax = roundMoney(
    Math.max(
      0,
      incomeTaxBeforeCredits - creditPointsValue - pensionTaxCredit - donationsTaxCredit
    )
  );

  const nationalInsurance = calculateNationalInsurance(grossSalary);

  const netSalary = roundMoney(
    grossSalary - employeePension - studyFund.employee - nationalInsurance - incomeTax
  );

  const employerPension = roundMoney(grossSalary * input.employerPensionRate);
  const employerSeverance = roundMoney(
    grossSalary * PENSION_DEFAULTS.severanceRate[input.severanceTrack]
  );
  const employerCost = roundMoney(
    grossSalary + employerPension + employerSeverance + studyFund.employer
  );

  return {
    grossSalary,
    employeePension,
    employeeStudyFund: studyFund.employee,
    nationalInsurance,
    taxableIncome: roundMoney(taxableIncome),
    incomeTaxBeforeCredits,
    creditPoints,
    creditPointsValue,
    pensionTaxCredit,
    donationsTaxCredit,
    incomeTax,
    netSalary,
    employerPension,
    employerSeverance,
    employerStudyFund: studyFund.employer,
    studyFundInsuredSalary: studyFund.insuredSalary,
    studyFundTaxableBenefit: studyFund.taxableEmployerBenefit,
    employerCost,
  };
};

// Deposits are made on the whole insured salary; the ceiling only limits which part of the
// employer's deposit is tax-free, so the excess is added to the employee's taxable income.
export const calculateStudyFund = (
  grossSalary: number,
  studyFund: StudyFundInput
): StudyFundContributions => {
  if (!studyFund.isEnabled) {
    return { insuredSalary: 0, employee: 0, employer: 0, taxableEmployerBenefit: 0 };
  }

  const insuredSalary = grossSalary * studyFund.insuredSalaryShare;
  const salaryAboveCeiling = Math.max(0, insuredSalary - STUDY_FUND_2026.salaryCeiling);

  return {
    insuredSalary: roundMoney(insuredSalary),
    employee: roundMoney(insuredSalary * studyFund.employeeRate),
    employer: roundMoney(insuredSalary * studyFund.employerRate),
    taxableEmployerBenefit: roundMoney(salaryAboveCeiling * studyFund.employerRate),
  };
};

export const calculateBracketTax = (taxableIncome: number, brackets: TaxBracket[]): number => {
  let tax = 0;
  let lowerBound = 0;

  for (const bracket of brackets) {
    if (taxableIncome <= lowerBound) {
      break;
    }

    const portionInBracket = Math.min(taxableIncome, bracket.upTo) - lowerBound;
    tax += portionInBracket * bracket.rate;
    lowerBound = bracket.upTo;
  }

  return tax;
};

export const calculatePensionTaxCredit = (employeePension: number, pensionSalary: number): number => {
  const creditBase = Math.min(
    employeePension,
    pensionSalary * PENSION_TAX_CREDIT_2026.maxSalaryShare,
    PENSION_TAX_CREDIT_2026.monthlyCap
  );

  return roundMoney(creditBase * PENSION_TAX_CREDIT_2026.rate);
};

export const calculateNationalInsurance = (insurableIncome: number): number => {
  const { reducedBandCeiling, maxInsurableIncome, reducedRate, fullRate } = NATIONAL_INSURANCE_2026;
  const cappedIncome = Math.min(Math.max(insurableIncome, 0), maxInsurableIncome);
  const reducedPortion = Math.min(cappedIncome, reducedBandCeiling);
  const fullPortion = Math.max(0, cappedIncome - reducedBandCeiling);

  return roundMoney(reducedPortion * reducedRate + fullPortion * fullRate);
};

const calculateMonthlyDonationsCredit = (annualDonations: number): number =>
  roundMoney((Math.max(annualDonations, 0) * DONATION_TAX_CREDIT_RATE) / MONTHS_IN_YEAR);

const roundMoney = (amount: number): number => fromCents(toCents(amount));
