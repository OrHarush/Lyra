import { describe, expect, it } from 'vitest';

import { calculateCompoundInterest } from '../compoundInterest';
import {
  COMPOUND_INTEREST_DEFAULTS,
  MAX_COMPOUND_YEARS,
  toCompoundInterestInput,
} from '../compoundInterestForm';
import { calculateCreditPoints } from '../creditPoints';
import { calculateNetSalary, calculateShareOfGross } from '../netSalary';
import { getLatestRates } from '../rates';
import {
  calculateNetSalaryFromForm,
  NET_SALARY_DEFAULTS,
  toCreditPointsInput,
  toNetSalaryInput,
  toPercent,
  toRate,
} from '../netSalaryForm';

describe('toRate / toPercent', () => {
  it('converts percent to rate and back', () => {
    expect(toRate(6.5)).toBe(0.065);
    expect(toPercent(0.065)).toBe(6.5);
  });

  it('treats missing values as zero', () => {
    expect(toRate(null)).toBe(0);
    expect(toRate(undefined)).toBe(0);
  });

  it('clamps rates to 0-100%', () => {
    expect(toRate(-5)).toBe(0);
    expect(toRate(250)).toBe(1);
  });
});

describe('net salary form defaults', () => {
  it('reproduce the 15,000 reference net', () => {
    const points = calculateCreditPoints(toCreditPointsInput(NET_SALARY_DEFAULTS));
    const breakdown = calculateNetSalary(toNetSalaryInput(NET_SALARY_DEFAULTS, points));

    expect(points).toBe(2.25);
    expect(breakdown.netSalary).toBe(11_174.19);
  });

  it('start with no degree points', () => {
    expect(NET_SALARY_DEFAULTS.degreeType).toBe('none');
    expect(NET_SALARY_DEFAULTS.degreeGraduationYear).toBe(0);
  });

  it('keeps the insured share at or below 100%', () => {
    const input = toNetSalaryInput({ ...NET_SALARY_DEFAULTS, studyFundInsuredSharePct: 180 }, 2.25);

    expect(input.studyFund.insuredSalaryShare).toBe(1);
  });

  it('ignores child rows without a bracket', () => {
    const input = toCreditPointsInput({ childAges: [undefined, {}, { bracket: 'age3' }] });

    expect(input.childAgeBrackets).toEqual(['age3']);
  });
});

describe('calculateNetSalaryFromForm', () => {
  it('runs the whole form-to-breakdown flow', () => {
    const { creditPoints, breakdown } = calculateNetSalaryFromForm(NET_SALARY_DEFAULTS);

    expect(creditPoints).toBe(2.25);
    expect(breakdown.netSalary).toBe(11_174.19);
  });

  it('gives a bachelor graduate of last year exactly one extra point', () => {
    const { creditPoints } = calculateNetSalaryFromForm({
      ...NET_SALARY_DEFAULTS,
      degreeType: 'bachelor',
      degreeGraduationYear: getLatestRates().ratesYear - 1,
    });

    expect(creditPoints).toBe(3.25);
  });
});

describe('calculateShareOfGross', () => {
  it('returns net as a rounded percent of gross', () => {
    const breakdown = calculateNetSalary(toNetSalaryInput(NET_SALARY_DEFAULTS, 2.25));

    expect(calculateShareOfGross(breakdown)).toBe(74);
  });

  it('returns 0 when gross is 0', () => {
    const breakdown = calculateNetSalary(toNetSalaryInput({ ...NET_SALARY_DEFAULTS, grossSalary: 0 }, 2.25));

    expect(calculateShareOfGross(breakdown)).toBe(0);
  });
});

describe('compound interest form', () => {
  it('maps the defaults and caps the years', () => {
    expect(toCompoundInterestInput(COMPOUND_INTEREST_DEFAULTS).years).toBe(20);
    expect(toCompoundInterestInput({ years: 500 }).years).toBe(MAX_COMPOUND_YEARS);
    expect(toCompoundInterestInput({ years: -3 }).years).toBe(0);
  });

  it('treats empty fields as zero', () => {
    const result = calculateCompoundInterest(toCompoundInterestInput({}));

    expect(result.finalBalance).toBe(0);
  });
});
