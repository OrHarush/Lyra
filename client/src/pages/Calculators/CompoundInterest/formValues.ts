import type { CompoundInterestInput } from '@lyra/shared';

export interface CompoundInterestFormValues {
  initialAmount: number | null;
  monthlyDeposit: number | null;
  annualReturnPct: number | null;
  annualFeePct: number | null;
  years: number | null;
}

export const COMPOUND_INTEREST_DEFAULTS: CompoundInterestFormValues = {
  initialAmount: 10_000,
  monthlyDeposit: 1_000,
  annualReturnPct: 7,
  annualFeePct: 0.5,
  years: 20,
};

export const MAX_YEARS = 60;

export const toCompoundInterestInput = (
  values: Partial<CompoundInterestFormValues>
): CompoundInterestInput => ({
  initialAmount: values.initialAmount ?? 0,
  monthlyDeposit: values.monthlyDeposit ?? 0,
  annualReturnPct: values.annualReturnPct ?? 0,
  annualFeePct: values.annualFeePct ?? 0,
  years: Math.min(values.years ?? 0, MAX_YEARS),
});
