import { NotificationIngestionOutcome } from '@lyra/shared';

import {
  merchantLookupKeys,
  ParsedWalletNotification,
  WalletPayment,
} from './walletNotificationParser';

export const WALLET_PACKAGE_NAME = 'com.google.android.apps.walletnfcrel';

const FALLBACK_MERCHANT = 'Google Wallet';
const NOTE_MAX_LENGTH = 200;

export interface PlannedTransaction {
  rawTitle: string;
  merchantKeys: string[];
  amount: number;
  type: 'Expense' | 'Income';
  note?: string;
  paymentLast4?: string;
}

export interface IngestionPlan {
  outcome: Exclude<NotificationIngestionOutcome, 'duplicate'>;
  transaction: PlannedTransaction | null;
  rawText: string | null;
}

interface NotificationText {
  text: string;
  bigText?: string;
}

export const planIngestion = (
  parsed: ParsedWalletNotification,
  notification: NotificationText
): IngestionPlan => {
  switch (parsed.kind) {
    case 'ignored':
      return { outcome: 'ignored', transaction: null, rawText: null };
    case 'parse_failed':
      return planForReview(parsed.merchant, notification);
    case 'purchase':
      return planPayment(parsed, 'Expense');
    case 'refund':
      return planPayment(parsed, 'Income');
  }
};

// Amount 0 keeps the row out of every balance until the user fills in the real amount.
const planForReview = (merchant: string, notification: NotificationText): IngestionPlan => {
  const rawText = joinText(notification);

  return {
    outcome: 'parse_failed',
    transaction: {
      ...merchantFields(merchant),
      amount: 0,
      type: 'Expense',
      note: truncateNote(`Wallet: ${rawText}`),
    },
    rawText,
  };
};

const planPayment = (payment: WalletPayment, type: 'Expense' | 'Income'): IngestionPlan => {
  const isForeign = payment.currency !== 'ILS';

  return {
    outcome: 'created',
    transaction: {
      ...merchantFields(payment.merchant),
      amount: isForeign ? 0 : payment.amount,
      type,
      note: buildNote(payment, type, isForeign),
      paymentLast4: payment.last4,
    },
    rawText: null,
  };
};

const buildNote = (
  payment: WalletPayment,
  type: 'Expense' | 'Income',
  isForeign: boolean
): string | undefined => {
  const parts = [
    type === 'Income' ? 'Refund' : null,
    isForeign ? `${payment.currency} ${payment.amount.toFixed(2)} (unconverted)` : null,
  ].filter((part): part is string => part !== null);

  return parts.length ? parts.join(' · ') : undefined;
};

const merchantFields = (merchant: string) => {
  const rawTitle = merchant || FALLBACK_MERCHANT;

  return { rawTitle, merchantKeys: merchantLookupKeys(rawTitle) };
};

const joinText = ({ text, bigText }: NotificationText): string =>
  bigText && bigText !== text ? `${text}\n${bigText}` : text;

const truncateNote = (note: string): string => note.slice(0, NOTE_MAX_LENGTH);
