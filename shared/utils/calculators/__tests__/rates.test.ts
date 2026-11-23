import { describe, expect, it } from 'vitest';

import { getAllRates, getLatestRates, resolveRates } from '../rates';

describe('rates config', () => {
  it.each(getAllRates().map(rates => [rates.ratesYear, rates] as const))(
    '%s brackets ascend and end at infinity',
    (_year, rates) => {
      const limits = rates.incomeTaxBrackets.map(bracket => bracket.upTo);

      expect([...limits].sort((a, b) => a - b)).toEqual(limits);
      expect(limits[limits.length - 1]).toBe(Infinity);
    }
  );

  it.each(getAllRates().map(rates => [rates.ratesYear, rates] as const))(
    '%s has a verification date, sources and a year range inside the rates year',
    (year, rates) => {
      expect(rates.verifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(rates.sources.length).toBeGreaterThan(0);
      expect(rates.effectiveFrom.startsWith(String(year))).toBe(true);
      expect(rates.effectiveTo.startsWith(String(year))).toBe(true);
    }
  );

  it('has no overlapping date ranges', () => {
    const sorted = [...getAllRates()].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));

    sorted.slice(1).forEach((rates, index) => {
      expect(rates.effectiveFrom > sorted[index].effectiveTo).toBe(true);
    });
  });
});

describe('resolveRates', () => {
  it('returns the matching rates as current inside their range', () => {
    const { rates, isCurrent } = resolveRates('2026-06-15');

    expect(rates.ratesYear).toBe(2026);
    expect(isCurrent).toBe(true);
  });

  it('includes both ends of the range', () => {
    expect(resolveRates('2026-01-01').isCurrent).toBe(true);
    expect(resolveRates('2026-12-31').isCurrent).toBe(true);
  });

  it('falls back to the newest rates and says they are not current after the last range', () => {
    const { rates, isCurrent } = resolveRates('2099-01-01');

    expect(rates).toBe(getLatestRates());
    expect(isCurrent).toBe(false);
  });
});
