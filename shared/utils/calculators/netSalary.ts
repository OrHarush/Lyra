import { fromCents, toCents } from '../money';
import { getLatestRates } from './rates';
import { IsraelTaxRates, SeveranceTrack, TaxBracket } from './rates/types';

export type { SeveranceTrack, TaxBracket };

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

export const calculateNetSalary = (
  input: NetSalaryInput,
  rates: IsraelTaxRates = getLatestRates()
): NetSalaryBreakdown => {
  const grossSalary = Math.max(input.grossSalary, 0);

  const employeePension = roundMoney(grossSalary * input.employeePensionRate);
  const studyFund = calculateStudyFund(grossSalary, input.studyFund, rates);

  const taxableIncome = grossSalary + studyFund.taxableEmployerBenefit;
  const incomeTaxBeforeCredits = roundMoney(calculateBracketTax(taxableIncome, rates.incomeTaxBrackets));
  const creditPoints = Math.max(input.creditPoints, 0);
  const creditPointsValue = roundMoney(creditPoints * rates.creditPointValue);
  const pensionTaxCredit = calculatePensionTaxCredit(employeePension, grossSalary, rates);
  const donationsTaxCredit = calculateMonthlyDonationsCredit(input.annualDonations, rates);
  const incomeTax = roundMoney(
    Math.max(
      0,
      incomeTaxBeforeCredits - creditPointsValue - pensionTaxCredit - donationsTaxCredit
    )
  );

  const nationalInsurance = calculateNationalInsurance(grossSalary, rates);

  const netSalary = roundMoney(
    grossSalary - employeePension - studyFund.employee - nationalInsurance - incomeTax
  );

  const employerPension = roundMoney(grossSalary * input.employerPensionRate);
  const employerSeverance = roundMoney(
    grossSalary * rates.pensionDefaults.severanceRate[input.severanceTrack]
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
  studyFund: StudyFundInput,
  rates: IsraelTaxRates = getLatestRates()
): StudyFundContributions => {
  if (!studyFund.isEnabled) {
    return { insuredSalary: 0, employee: 0, employer: 0, taxableEmployerBenefit: 0 };
  }

  const insuredSalary = grossSalary * studyFund.insuredSalaryShare;
  const salaryAboveCeiling = Math.max(0, insuredSalary - rates.studyFund.salaryCeiling);

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

export const calculatePensionTaxCredit = (
  employeePension: number,
  pensionSalary: number,
  rates: IsraelTaxRates = getLatestRates()
): number => {
  const { maxSalaryShare, monthlyCap, rate } = rates.pensionTaxCredit;
  const creditBase = Math.min(employeePension, pensionSalary * maxSalaryShare, monthlyCap);

  return roundMoney(creditBase * rate);
};

export const calculateNationalInsurance = (
  insurableIncome: number,
  rates: IsraelTaxRates = getLatestRates()
): number => {
  const { reducedBandCeiling, maxInsurableIncome, reducedRate, fullRate } = rates.nationalInsurance;
  const cappedIncome = Math.min(Math.max(insurableIncome, 0), maxInsurableIncome);
  const reducedPortion = Math.min(cappedIncome, reducedBandCeiling);
  const fullPortion = Math.max(0, cappedIncome - reducedBandCeiling);

  return roundMoney(reducedPortion * reducedRate + fullPortion * fullRate);
};

const calculateMonthlyDonationsCredit = (annualDonations: number, rates: IsraelTaxRates): number =>
  roundMoney((Math.max(annualDonations, 0) * rates.donationTaxCreditRate) / MONTHS_IN_YEAR);

export const calculateShareOfGross = (breakdown: NetSalaryBreakdown): number =>
  breakdown.grossSalary > 0 ? Math.round((breakdown.netSalary / breakdown.grossSalary) * 100) : 0;

const roundMoney = (amount: number): number => fromCents(toCents(amount));
