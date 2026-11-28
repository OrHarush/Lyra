import { describe, expect, it } from 'vitest';

import { parseAndroidWalletAmount } from '../../src/services/shortcutService';

describe('parseAndroidWalletAmount (MacroDroid endpoint)', () => {
  it.each([
    ['₪44.80 with American Express Hever ••1135', 44.8],
    ['₪1,234.50 with American Express Hever ••1135', 1234.5],
    ['₪1,234 with American Express Hever ••1135', 1234],
    ['₪44,80', 44.8],
    ['₪45', 45],
  ])('%s → %d', (text, expected) => {
    expect(parseAndroidWalletAmount(text)).toBe(expected);
  });

  it('rejects text without an amount', () => {
    expect(() => parseAndroidWalletAmount('Card ready')).toThrow('Could not parse amount');
  });
});
