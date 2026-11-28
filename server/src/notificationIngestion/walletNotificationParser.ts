export type WalletCurrency = 'ILS' | 'USD' | 'EUR' | 'GBP';

export interface WalletNotificationInput {
  title: string;
  text: string;
  bigText?: string;
}

export interface WalletPayment {
  merchant: string;
  amount: number;
  currency: WalletCurrency;
  cardName: string;
  last4: string;
}

export type ParsedWalletNotification =
  | ({ kind: 'purchase' } & WalletPayment)
  | ({ kind: 'refund' } & WalletPayment)
  | { kind: 'ignored' }
  | { kind: 'parse_failed'; merchant: string };

const CURRENCY_BY_SYMBOL: Record<string, WalletCurrency> = {
  '₪': 'ILS',
  $: 'USD',
  '€': 'EUR',
  '£': 'GBP',
};

const CURRENCY_SYMBOLS = /[₪$€£]/u;

// Wallet text arrives with bidi control marks and non-breaking spaces on Hebrew-locale phones.
const INVISIBLE_MARKS = /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/gu;
const ODD_SPACES = /[\u00a0\u202f\u2007]/gu;

const PURCHASE_PATTERN =
  /^(?<symbol>[₪$€£])\s?(?<amount>\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)\s+with\s+(?<cardName>.+?)\s*[•·]{1,4}\s?(?<last4>\d{4})$/u;

// TODO(wallet-refund): add REFUND_PATTERN once a real refund notification sample exists.

export const parseWalletNotification = (
  input: WalletNotificationInput
): ParsedWalletNotification => {
  const merchant = cleanText(input.title);
  const candidates = [input.text, input.bigText].filter(isPresent).map(cleanText);

  if (!candidates.some(hasCurrencySymbol)) {
    return { kind: 'ignored' };
  }

  const payment = candidates.map(text => matchPurchase(merchant, text)).find(isPresent);

  if (!merchant || !payment) {
    return { kind: 'parse_failed', merchant };
  }

  return { kind: 'purchase', ...payment };
};

export const merchantLookupKeys = (merchant: string): string[] => {
  const exact = cleanText(merchant);
  const despaced = exact.replace(/\s+/gu, '');

  return exact === despaced ? [exact] : [exact, despaced];
};

const matchPurchase = (merchant: string, text: string): WalletPayment | undefined => {
  const groups = text.match(PURCHASE_PATTERN)?.groups;

  if (!groups) {
    return undefined;
  }

  const amount = Number(groups.amount.replace(/,/gu, ''));

  if (!Number.isFinite(amount) || amount <= 0) {
    return undefined;
  }

  return {
    merchant,
    amount,
    currency: CURRENCY_BY_SYMBOL[groups.symbol],
    cardName: groups.cardName.trim(),
    last4: groups.last4,
  };
};

const cleanText = (value: string): string =>
  value.replace(INVISIBLE_MARKS, '').replace(ODD_SPACES, ' ').replace(/\s+/gu, ' ').trim();

const hasCurrencySymbol = (text: string): boolean => CURRENCY_SYMBOLS.test(text);

const isPresent = <T>(value: T | undefined | null): value is T =>
  value !== undefined && value !== null && value !== '';
