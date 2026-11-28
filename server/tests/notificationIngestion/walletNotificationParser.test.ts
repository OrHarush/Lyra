import { describe, expect, it } from 'vitest';

import {
  merchantLookupKeys,
  parseWalletNotification,
} from '../../src/notificationIngestion/walletNotificationParser';

const AMEX = { cardName: 'American Express Hever', last4: '1135' };

describe('parseWalletNotification: purchases', () => {
  it.each([
    [
      'real sample, letter-spaced merchant',
      { title: 'a m p m', text: '₪44.80 with American Express Hever ••1135' },
      { merchant: 'a m p m', amount: 44.8, currency: 'ILS', ...AMEX },
    ],
    [
      'thousands separator',
      { title: 'IKEA', text: '₪1,234.50 with American Express Hever ••1135' },
      { merchant: 'IKEA', amount: 1234.5, currency: 'ILS', ...AMEX },
    ],
    [
      'millions with separators',
      { title: 'Car', text: '₪1,234,567.00 with American Express Hever ••1135' },
      { merchant: 'Car', amount: 1234567, currency: 'ILS', ...AMEX },
    ],
    [
      'whole amount without decimals',
      { title: 'Kiosk', text: '₪45 with American Express Hever ••1135' },
      { merchant: 'Kiosk', amount: 45, currency: 'ILS', ...AMEX },
    ],
    [
      'bidi marks and non-breaking spaces',
      { title: '\u200fa m p m', text: '\u200e₪44.80\u00a0with American Express Hever\u00a0••1135' },
      { merchant: 'a m p m', amount: 44.8, currency: 'ILS', ...AMEX },
    ],
    [
      'card details only in bigText',
      { title: 'ampm', text: 'Payment made', bigText: '₪44.80 with American Express Hever ••1135' },
      { merchant: 'ampm', amount: 44.8, currency: 'ILS', ...AMEX },
    ],
    [
      'foreign currency in the same format',
      { title: 'Amazon', text: '$12.00 with American Express Hever ••1135' },
      { merchant: 'Amazon', amount: 12, currency: 'USD', ...AMEX },
    ],
  ])('%s', (_label, input, expected) => {
    expect(parseWalletNotification(input)).toEqual({ kind: 'purchase', ...expected });
  });
});

describe('parseWalletNotification: ignored', () => {
  it.each([
    ['pass added', { title: 'Boarding pass added', text: 'Your pass is ready to use' }],
    ['card ready', { title: 'Card ready', text: 'American Express Hever ••1135 is ready to use' }],
    ['empty text', { title: 'Google Wallet', text: '' }],
  ])('%s', (_label, input) => {
    expect(parseWalletNotification(input)).toEqual({ kind: 'ignored' });
  });
});

describe('parseWalletNotification: parse_failed never guesses an amount', () => {
  it.each([
    ['unknown wording', { title: 'ampm', text: 'You paid ₪44.80 at ampm' }],
    ['missing last4', { title: 'ampm', text: '₪44.80 with American Express Hever' }],
    ['zero amount', { title: 'ampm', text: '₪0.00 with American Express Hever ••1135' }],
    [
      'malformed separators',
      { title: 'ampm', text: '₪1,23.50 with American Express Hever ••1135' },
    ],
    [
      'Hebrew wording (no sample yet)',
      { title: 'ampm', text: '₪44.80 באמצעות אמריקן אקספרס ••1135' },
    ],
  ])('%s', (_label, input) => {
    expect(parseWalletNotification(input)).toEqual({ kind: 'parse_failed', merchant: 'ampm' });
  });

  it('fails when the merchant title is blank', () => {
    expect(
      parseWalletNotification({ title: '  ', text: '₪44.80 with American Express Hever ••1135' })
    ).toEqual({ kind: 'parse_failed', merchant: '' });
  });
});

describe('parseWalletNotification: pending real samples', () => {
  it.todo('refund notification returns kind refund with the refunded amount');
  it.todo('foreign-currency notification from a real sample matches the purchase pattern');
  it.todo('Hebrew-locale purchase notification parses');
});

describe('merchantLookupKeys', () => {
  it('tries the exact title first, then the despaced one', () => {
    expect(merchantLookupKeys(' a m p m ')).toEqual(['a m p m', 'ampm']);
  });

  it('returns a single key when there is nothing to despace', () => {
    expect(merchantLookupKeys('ampm')).toEqual(['ampm']);
  });
});
