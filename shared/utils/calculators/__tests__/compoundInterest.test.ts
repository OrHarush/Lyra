import { describe, expect, it } from 'vitest';

import { calculateCompoundInterest } from '../compoundInterest';

describe('calculateCompoundInterest', () => {
  it('returns the initial amount when there is no time', () => {
    const result = calculateCompoundInterest({
      initialAmount: 10_000,
      monthlyDeposit: 500,
      annualReturnPct: 6,
      annualFeePct: 0,
      years: 0,
    });

    expect(result.finalBalance).toBe(10_000);
    expect(result.totalInterest).toBe(0);
    expect(result.yearlyPoints).toHaveLength(1);
  });

  it('only sums deposits when the return is zero', () => {
    const result = calculateCompoundInterest({
      initialAmount: 1_000,
      monthlyDeposit: 100,
      annualReturnPct: 0,
      annualFeePct: 0,
      years: 2,
    });

    expect(result.finalBalance).toBe(3_400);
    expect(result.totalDeposited).toBe(3_400);
    expect(result.totalInterest).toBe(0);
  });

  it('compounds a lump sum monthly', () => {
    const result = calculateCompoundInterest({
      initialAmount: 10_000,
      monthlyDeposit: 0,
      annualReturnPct: 12,
      annualFeePct: 0,
      years: 1,
    });

    expect(result.finalBalance).toBeCloseTo(10_000 * 1.01 ** 12, 1);
  });

  it('matches the future-value-of-annuity formula for monthly deposits', () => {
    const r = 0.06 / 12;
    const n = 10 * 12;
    const expected = 1_000 * ((1 + r) ** n - 1) / r;

    const result = calculateCompoundInterest({
      initialAmount: 0,
      monthlyDeposit: 1_000,
      annualReturnPct: 6,
      annualFeePct: 0,
      years: 10,
    });

    expect(result.finalBalance).toBeCloseTo(expected, 1);
    expect(result.totalDeposited).toBe(120_000);
  });

  it('subtracts the management fee from the return', () => {
    const withFee = calculateCompoundInterest({
      initialAmount: 10_000,
      monthlyDeposit: 0,
      annualReturnPct: 7,
      annualFeePct: 1,
      years: 5,
    });
    const equivalent = calculateCompoundInterest({
      initialAmount: 10_000,
      monthlyDeposit: 0,
      annualReturnPct: 6,
      annualFeePct: 0,
      years: 5,
    });

    expect(withFee.finalBalance).toBe(equivalent.finalBalance);
  });

  it('emits one point per year plus the starting point', () => {
    const result = calculateCompoundInterest({
      initialAmount: 0,
      monthlyDeposit: 100,
      annualReturnPct: 5,
      annualFeePct: 0,
      years: 30,
    });

    expect(result.yearlyPoints).toHaveLength(31);
    expect(result.yearlyPoints[30].year).toBe(30);
  });
});
