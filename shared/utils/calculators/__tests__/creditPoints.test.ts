import { describe, expect, it } from 'vitest';

import {
  calculateCreditPoints,
  calculateDegreePoints,
  calculateReserveCreditPoints,
  CreditPointsInput,
  getChildCreditPoints,
  getDefaultGraduationYear,
} from '../creditPoints';
import { ISRAEL_TAX_RATES_2026 } from '../rates';

const noExtras: CreditPointsInput = {
  sex: 'male',
  childAgeBrackets: [],
  isSingleParent: false,
  disabledChildrenCount: 0,
  serviceType: 'none',
  immigrationPeriod: 'none',
  degreeType: 'none',
  degreeGraduationYear: 0,
  reserveDays: 0,
  manualPoints: 0,
};

describe('calculateCreditPoints — base', () => {
  it('gives a man 2.25 points and a woman 2.75', () => {
    expect(calculateCreditPoints(noExtras)).toBe(2.25);
    expect(calculateCreditPoints({ ...noExtras, sex: 'female' })).toBe(2.75);
  });
});

describe('calculateCreditPoints — children', () => {
  it.each([
    ['birthYear', 2.5, 2.5],
    ['age1to2', 4.5, 4.5],
    ['age3', 3.5, 3.5],
    ['age4to5', 2.5, 2.5],
    ['age6to17', 1, 2],
    ['age18', 0, 0.5],
  ] as const)('%s gives %s to a father and %s to a mother', (bracket, male, female) => {
    expect(getChildCreditPoints(bracket, 'male')).toBe(male);
    expect(getChildCreditPoints(bracket, 'female')).toBe(female);
  });

  it('sums points across several children', () => {
    const points = calculateCreditPoints({
      ...noExtras,
      childAgeBrackets: ['age3', 'age6to17'],
    });

    expect(points).toBe(2.25 + 3.5 + 1);
  });

  it('adds 1 point for a single parent', () => {
    expect(calculateCreditPoints({ ...noExtras, isSingleParent: true })).toBe(3.25);
  });

  it('adds 2 points per child with a disability allowance', () => {
    expect(calculateCreditPoints({ ...noExtras, disabledChildrenCount: 2 })).toBe(6.25);
  });
});

describe('calculateCreditPoints — service, immigration and degrees', () => {
  it('gives 2 points for full service and 1 for short service', () => {
    expect(calculateCreditPoints({ ...noExtras, serviceType: 'full' })).toBe(4.25);
    expect(calculateCreditPoints({ ...noExtras, serviceType: 'short' })).toBe(3.25);
  });

  it('gives 1, 3, 2 and 1 monthly points across the four 54-month immigration stages', () => {
    expect(calculateCreditPoints({ ...noExtras, immigrationPeriod: 'first12Months' })).toBe(3.25);
    expect(calculateCreditPoints({ ...noExtras, immigrationPeriod: 'next18Months' })).toBe(5.25);
    expect(calculateCreditPoints({ ...noExtras, immigrationPeriod: 'next12Months' })).toBe(4.25);
    expect(calculateCreditPoints({ ...noExtras, immigrationPeriod: 'last12Months' })).toBe(3.25);
  });
});

describe('calculateDegreePoints', () => {
  const rates = ISRAEL_TAX_RATES_2026;
  const taxYear = rates.ratesYear;

  it('gives a bachelor graduate from 2023 on one point a year, from the year after graduating', () => {
    expect(calculateDegreePoints('bachelor', taxYear, rates)).toBe(0);
    expect(calculateDegreePoints('bachelor', taxYear - 1, rates)).toBe(1);
    expect(calculateDegreePoints('bachelor', taxYear - 3, rates)).toBe(1);
  });

  it('stops after three tax years for a bachelor graduate', () => {
    expect(calculateDegreePoints('bachelor', taxYear - 4, rates)).toBe(0);
  });

  it('never multiplies points by years of study', () => {
    expect(calculateCreditPoints({ ...noExtras, degreeType: 'bachelor', degreeGraduationYear: taxYear - 1 })).toBe(3.25);
  });

  it('gives a master graduate from 2023 half a point a year for two years', () => {
    expect(calculateDegreePoints('master', taxYear - 1, rates)).toBe(0.5);
    expect(calculateDegreePoints('master', taxYear - 2, rates)).toBe(0.5);
    expect(calculateDegreePoints('master', taxYear - 3, rates)).toBe(0);
  });

  it('gives no points once the legacy claim window has passed', () => {
    expect(calculateDegreePoints('bachelor', 2022, rates)).toBe(0);
    expect(calculateDegreePoints('bachelor', 2020, rates)).toBe(0);
  });

  it('gives one point to a graduate from within the legacy claim window', () => {
    const legacyRates = { ...rates, ratesYear: 2024 };

    expect(calculateDegreePoints('bachelor', 2022, legacyRates)).toBe(1);
    expect(calculateDegreePoints('bachelor', 2021, legacyRates)).toBe(0);
  });

  it('ignores graduation before the legacy rule and when there is no degree', () => {
    expect(calculateDegreePoints('bachelor', 2010, rates)).toBe(0);
    expect(calculateDegreePoints('none', taxYear - 1, rates)).toBe(0);
    expect(calculateDegreePoints('bachelor', 0, rates)).toBe(0);
  });

  it('defaults the graduation year to last year only when there is a degree', () => {
    expect(getDefaultGraduationYear('none', rates)).toBe(0);
    expect(getDefaultGraduationYear('master', rates)).toBe(taxYear - 1);
  });
});

describe('calculateReserveCreditPoints', () => {
  it.each([
    [0, 0],
    [29, 0],
    [30, 0.5],
    [39, 0.5],
    [40, 0.75],
    [49, 0.75],
    [50, 1],
    [54, 1],
    [55, 1.25],
    [60, 1.5],
    [100, 3.5],
    [200, 4],
  ])('%s reserve days give %s points', (days, points) => {
    expect(calculateReserveCreditPoints(days)).toBe(points);
  });
});

describe('calculateCreditPoints — manual and combined', () => {
  it('adds manually entered points', () => {
    expect(calculateCreditPoints({ ...noExtras, manualPoints: 0.5 })).toBe(2.75);
  });

  it('adds everything together', () => {
    const points = calculateCreditPoints({
      sex: 'female',
      childAgeBrackets: ['age1to2'],
      isSingleParent: true,
      disabledChildrenCount: 1,
      serviceType: 'short',
      immigrationPeriod: 'none',
      degreeType: 'bachelor',
      degreeGraduationYear: 2025,
      reserveDays: 55,
      manualPoints: 0.25,
    });

    expect(points).toBe(2.75 + 4.5 + 1 + 2 + 1 + 1 + 1.25 + 0.25);
  });
});
