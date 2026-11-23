import {
  calculateShareOfGross,
  getLatestRates,
  NetSalaryBreakdown,
  NetSalaryInput,
  toPercent,
} from '@lyra/shared';
import type { TFunction } from 'i18next';

import { formatCurrency } from '@/utils/currency';

interface BuildNetSalarySummaryTextParams {
  breakdown: NetSalaryBreakdown;
  input: NetSalaryInput;
  t: TFunction;
}

const SALARY_CURRENCY = 'ILS';
const TOP_BULLET = '•';
const DETAIL_BULLET = '   ◦';

const toMoney = (value: number) => formatCurrency(Math.round(value), SALARY_CURRENCY);
const toDeduction = (value: number) => `-${toMoney(value)}`;

export const buildNetSalarySummaryText = ({ breakdown, input, t }: BuildNetSalarySummaryTextParams) => {
  const tn = (key: string, options?: Record<string, unknown>) => t(`netSalary.${key}`, options);
  const { ratesYear, pensionTaxCredit, donationTaxCreditRate } = getLatestRates();
  const shareOfGross = calculateShareOfGross(breakdown);

  const deductions = [
    `${TOP_BULLET} ${tn('employeePension')}: ${toDeduction(breakdown.employeePension)}`,
    breakdown.employeeStudyFund > 0 &&
      `${TOP_BULLET} ${tn('employeeStudyFund')}: ${toDeduction(breakdown.employeeStudyFund)}`,
    `${TOP_BULLET} ${tn('nationalInsurance')}: ${toDeduction(breakdown.nationalInsurance)}`,
    `${TOP_BULLET} ${tn('incomeTax')}: ${toDeduction(breakdown.incomeTax)}`,
    `${DETAIL_BULLET} ${tn('taxBeforeCredits')}: ${toMoney(breakdown.incomeTaxBeforeCredits)}`,
    breakdown.studyFundTaxableBenefit > 0 &&
      `${DETAIL_BULLET} ${tn('studyFundTaxableBenefit')}: ${toMoney(breakdown.studyFundTaxableBenefit)}`,
    `${DETAIL_BULLET} ${tn('creditPoints', { points: Number(breakdown.creditPoints.toFixed(2)) })}: ${toDeduction(breakdown.creditPointsValue)}`,
    `${DETAIL_BULLET} ${tn('pensionTaxCredit', { pct: toPercent(pensionTaxCredit.rate) })}: ${toDeduction(breakdown.pensionTaxCredit)}`,
    breakdown.donationsTaxCredit > 0 &&
      `${DETAIL_BULLET} ${tn('donationsCredit', { pct: toPercent(donationTaxCreditRate) })}: ${toDeduction(breakdown.donationsTaxCredit)}`,
  ];

  const { studyFund } = input;
  const studyFundAssumption = studyFund.isEnabled
    ? tn('copy.studyFundAssumption', {
        employee: toPercent(studyFund.employeeRate),
        employer: toPercent(studyFund.employerRate),
        share: toPercent(studyFund.insuredSalaryShare),
      })
    : tn('copy.studyFundOff');

  const assumptions = [
    tn('copy.pensionAssumption', {
      employee: toPercent(input.employeePensionRate),
      employer: toPercent(input.employerPensionRate),
    }),
    studyFundAssumption,
    tn('creditPoints', { points: Number(breakdown.creditPoints.toFixed(2)) }),
  ];

  return [
    tn('copy.title', { year: ratesYear }),
    '',
    `${tn('gross')}: ${toMoney(breakdown.grossSalary)}`,
    '',
    `${tn('copy.deductionsTitle')}:`,
    ...deductions.filter(Boolean),
    '',
    `${tn('copy.formula')}`,
    `${tn('netLabel')}: ${toMoney(breakdown.netSalary)} (${tn('netShareOfGross', { pct: shareOfGross })})`,
    `${tn('employerCost')}: ${toMoney(breakdown.employerCost)}`,
    '',
    `${tn('copy.assumptionsTitle')}:`,
    ...assumptions.map(line => `${TOP_BULLET} ${line}`),
    '',
    tn('disclaimer', { year: ratesYear }),
  ].join('\n');
};
