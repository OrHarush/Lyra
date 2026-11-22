import { fromCents, toCents } from '../money';

export interface CompoundInterestInput {
  initialAmount: number;
  monthlyDeposit: number;
  annualReturnPct: number;
  annualFeePct: number;
  years: number;
}

export interface CompoundInterestYearPoint {
  year: number;
  deposited: number;
  interest: number;
  balance: number;
}

export interface CompoundInterestResult {
  finalBalance: number;
  totalDeposited: number;
  totalInterest: number;
  yearlyPoints: CompoundInterestYearPoint[];
}

const MONTHS_IN_YEAR = 12;

export const calculateCompoundInterest = (input: CompoundInterestInput): CompoundInterestResult => {
  const initialAmount = Math.max(input.initialAmount, 0);
  const monthlyDeposit = Math.max(input.monthlyDeposit, 0);
  const years = Math.max(Math.floor(input.years), 0);
  const monthlyRate = (input.annualReturnPct - input.annualFeePct) / 100 / MONTHS_IN_YEAR;

  let balance = initialAmount;
  let deposited = initialAmount;
  const yearlyPoints = [buildYearPoint(0, deposited, balance)];

  for (let year = 1; year <= years; year++) {
    for (let month = 0; month < MONTHS_IN_YEAR; month++) {
      balance = balance * (1 + monthlyRate) + monthlyDeposit;
      deposited += monthlyDeposit;
    }

    yearlyPoints.push(buildYearPoint(year, deposited, balance));
  }

  const lastPoint = yearlyPoints[yearlyPoints.length - 1];

  return {
    finalBalance: lastPoint.balance,
    totalDeposited: lastPoint.deposited,
    totalInterest: lastPoint.interest,
    yearlyPoints,
  };
};

const buildYearPoint = (year: number, deposited: number, balance: number): CompoundInterestYearPoint => ({
  year,
  deposited: roundMoney(deposited),
  interest: roundMoney(balance - deposited),
  balance: roundMoney(balance),
});

const roundMoney = (amount: number): number => fromCents(toCents(amount));
