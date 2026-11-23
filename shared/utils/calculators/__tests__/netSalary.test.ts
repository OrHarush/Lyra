import { describe, expect, it } from 'vitest';

import {
  calculateBracketTax,
  calculateNationalInsurance,
  calculateNetSalary,
  calculateStudyFund,
  NetSalaryInput,
  StudyFundInput,
} from '../netSalary';
import { ISRAEL_TAX_RATES_2026 } from '../rates';

const standardStudyFund: StudyFundInput = {
  isEnabled: true,
  employeeRate: 0.025,
  employerRate: 0.075,
  insuredSalaryShare: 1,
};

const baseInput: NetSalaryInput = {
  grossSalary: 15_000,
  creditPoints: 2.25,
  employeePensionRate: 0.06,
  employerPensionRate: 0.065,
  severanceTrack: 'regular',
  studyFund: standardStudyFund,
  annualDonations: 0,
};

describe('calculateNetSalary — reference example (15,000 ₪, 2.25 points, standard study fund)', () => {
  const result = calculateNetSalary(baseInput);

  it('deducts the employee pension and study fund from gross', () => {
    expect(result.employeePension).toBe(900);
    expect(result.employeeStudyFund).toBe(375);
  });

  it('taxes the full gross, not gross minus pension', () => {
    expect(result.taxableIncome).toBe(15_000);
    expect(result.incomeTaxBeforeCredits).toBe(2_116);
  });

  it('applies credit points and the capped 35% pension credit', () => {
    expect(result.creditPointsValue).toBe(544.5);
    expect(result.pensionTaxCredit).toBe(237.65);
    expect(result.incomeTax).toBe(1_333.85);
  });

  it('computes banded national insurance', () => {
    expect(result.nationalInsurance).toBe(1_216.96);
  });

  it('produces the expected net', () => {
    expect(result.netSalary).toBe(11_174.19);
  });

  it('adds employer contributions to the employer cost', () => {
    expect(result.employerPension).toBe(975);
    expect(result.employerSeverance).toBe(900);
    expect(result.employerStudyFund).toBe(1_125);
    expect(result.employerCost).toBe(18_000);
  });
});

describe('calculateNetSalary — credit points and credits', () => {
  it('never returns negative income tax when credits exceed tax', () => {
    const result = calculateNetSalary({ ...baseInput, grossSalary: 5_000 });

    expect(result.incomeTaxBeforeCredits).toBe(500);
    expect(result.incomeTax).toBe(0);
  });

  it('values each credit point at 242 ₪', () => {
    const result = calculateNetSalary({ ...baseInput, creditPoints: 5.5 });

    expect(result.creditPointsValue).toBe(1_331);
  });

  it('limits the pension credit to 7% of salary for low earners', () => {
    const result = calculateNetSalary({
      ...baseInput,
      grossSalary: 8_000,
      employeePensionRate: 0.07,
    });

    expect(result.pensionTaxCredit).toBe(196);
  });

  it('turns annual donations into a monthly 35% credit', () => {
    const result = calculateNetSalary({ ...baseInput, annualDonations: 1_200 });

    expect(result.donationsTaxCredit).toBe(35);
    expect(result.incomeTax).toBe(1_298.85);
  });
});

describe('calculateNetSalary — pension and severance', () => {
  it('uses the employer rate that was entered', () => {
    const result = calculateNetSalary({ ...baseInput, employerPensionRate: 0.075 });

    expect(result.employerPension).toBe(1_125);
  });

  it('uses 8.33% severance on the section 14 track', () => {
    const result = calculateNetSalary({ ...baseInput, severanceTrack: 'section14' });

    expect(result.employerSeverance).toBe(1_249.5);
  });
});

describe('calculateNetSalary — study fund', () => {
  it('skips study fund deductions when the fund is off', () => {
    const result = calculateNetSalary({
      ...baseInput,
      studyFund: { ...standardStudyFund, isEnabled: false },
    });

    expect(result.employeeStudyFund).toBe(0);
    expect(result.employerStudyFund).toBe(0);
    expect(result.studyFundTaxableBenefit).toBe(0);
  });

  it('applies the insured share (80% contract) to both sides', () => {
    const result = calculateNetSalary({
      ...baseInput,
      studyFund: { ...standardStudyFund, insuredSalaryShare: 0.8 },
    });

    expect(result.studyFundInsuredSalary).toBe(12_000);
    expect(result.employeeStudyFund).toBe(300);
    expect(result.employerStudyFund).toBe(900);
    expect(result.netSalary).toBe(11_249.19);
    expect(result.employerCost).toBe(17_775);
  });

  it('supports custom rates such as a 2% employee deposit', () => {
    const result = calculateNetSalary({
      ...baseInput,
      studyFund: { ...standardStudyFund, employeeRate: 0.02, employerRate: 0.06 },
    });

    expect(result.employeeStudyFund).toBe(300);
    expect(result.employerStudyFund).toBe(900);
  });

  it('taxes the employer deposit on insured salary above the ceiling', () => {
    const withFund = calculateNetSalary({ ...baseInput, grossSalary: 30_000 });
    const withoutFund = calculateNetSalary({
      ...baseInput,
      grossSalary: 30_000,
      studyFund: { ...standardStudyFund, isEnabled: false },
    });

    expect(withFund.studyFundTaxableBenefit).toBe(1_071.6);
    expect(withFund.taxableIncome).toBe(31_071.6);
    expect(withFund.incomeTaxBeforeCredits - withoutFund.incomeTaxBeforeCredits).toBeCloseTo(375.06, 2);
  });

  it('only taxes the part of an 80% insured salary that exceeds the ceiling', () => {
    const result = calculateStudyFund(20_000, { ...standardStudyFund, insuredSalaryShare: 0.8 });

    expect(result.insuredSalary).toBe(16_000);
    expect(result.taxableEmployerBenefit).toBe(21.6);
  });

  it('has no taxable benefit when the insured salary is under the ceiling', () => {
    const result = calculateStudyFund(15_000, standardStudyFund);

    expect(result.taxableEmployerBenefit).toBe(0);
  });
});

describe('calculateBracketTax', () => {
  it('returns 0 for no income', () => {
    expect(calculateBracketTax(0, ISRAEL_TAX_RATES_2026.incomeTaxBrackets)).toBe(0);
  });

  it('taxes only within the first bracket for low income', () => {
    expect(calculateBracketTax(7_010, ISRAEL_TAX_RATES_2026.incomeTaxBrackets)).toBeCloseTo(701);
  });

  it('applies 50% above the top bracket', () => {
    const atTop = calculateBracketTax(60_130, ISRAEL_TAX_RATES_2026.incomeTaxBrackets);

    expect(calculateBracketTax(70_130, ISRAEL_TAX_RATES_2026.incomeTaxBrackets) - atTop).toBeCloseTo(5_000);
  });
});

describe('calculateNationalInsurance', () => {
  it('uses only the reduced rate below the band ceiling', () => {
    expect(calculateNationalInsurance(5_000)).toBe(213.5);
  });

  it('stops growing above the max insurable income', () => {
    expect(calculateNationalInsurance(80_000)).toBe(calculateNationalInsurance(51_910));
  });
});
