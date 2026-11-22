import type { NetSalaryBreakdown } from '@lyra/shared';

export type DistributionPaletteColor = 'success' | 'primary' | 'warning' | 'info';

export interface DistributionSegment {
  key: string;
  value: number;
  paletteColor: DistributionPaletteColor;
}

export const buildDistributionSegments = (breakdown: NetSalaryBreakdown): DistributionSegment[] => [
  { key: 'net', value: breakdown.netSalary, paletteColor: 'success' },
  { key: 'incomeTax', value: breakdown.incomeTax, paletteColor: 'primary' },
  { key: 'nationalInsurance', value: breakdown.nationalInsurance, paletteColor: 'warning' },
  {
    key: 'savings',
    value: breakdown.employeePension + breakdown.employeeStudyFund,
    paletteColor: 'info',
  },
];

export const toThemeColorPath = (color: DistributionPaletteColor) => `${color}.main`;
