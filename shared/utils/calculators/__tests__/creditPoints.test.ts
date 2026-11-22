import { describe, expect, it } from 'vitest';

import {
  calculateCreditPoints,
  calculateReserveCreditPoints,
  CreditPointsInput,
  getChildCreditPoints,
} from '../creditPoints';

const noExtras: CreditPointsInput = {
  sex: 'male',
  childAgeBrackets: [],
  isSingleParent: false,
  disabledChildrenCount: 0,
  serviceType: 'none',
  immigrationPeriod: 'none',
  degreeType: 'none',
  degreeYears: 0,
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

  it('gives 3, 2 or 1 points by immigration period', () => {
    expect(calculateCreditPoints({ ...noExtras, immigrationPeriod: 'first18Months' })).toBe(5.25);
    expect(calculateCreditPoints({ ...noExtras, immigrationPeriod: 'next12Months' })).toBe(4.25);
    expect(calculateCreditPoints({ ...noExtras, immigrationPeriod: 'last12Months' })).toBe(3.25);
  });

  it('gives 1 point per bachelor year, up to 3 years', () => {
    expect(calculateCreditPoints({ ...noExtras, degreeType: 'bachelor', degreeYears: 2 })).toBe(4.25);
    expect(calculateCreditPoints({ ...noExtras, degreeType: 'bachelor', degreeYears: 5 })).toBe(5.25);
  });

  it('gives 0.5 point per master year, up to 2 years', () => {
    expect(calculateCreditPoints({ ...noExtras, degreeType: 'master', degreeYears: 1 })).toBe(2.75);
    expect(calculateCreditPoints({ ...noExtras, degreeType: 'master', degreeYears: 4 })).toBe(3.25);
  });

  it('ignores degree years when there is no degree', () => {
    expect(calculateCreditPoints({ ...noExtras, degreeType: 'none', degreeYears: 3 })).toBe(2.25);
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
      degreeYears: 3,
      reserveDays: 55,
      manualPoints: 0.25,
    });

    expect(points).toBe(2.75 + 4.5 + 1 + 2 + 1 + 3 + 1.25 + 0.25);
  });
});
