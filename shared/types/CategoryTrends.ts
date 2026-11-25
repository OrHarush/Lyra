import { DefaultCategoryKey } from './defaultCategories';

export type TrendDeltaKind = 'percent' | 'new' | 'smallBase' | 'none';

export type TrendDeltaBasis = 'fullMonth' | 'monthToDate';

export interface TrendDelta {
  kind: TrendDeltaKind;
  percent?: number;
  absolute: number;
  basis: TrendDeltaBasis;
}

export interface CategoryTrendMonth {
  period: string;
  total: number;
  budget: number | null;
  delta: TrendDelta;
}

export interface CategoryTrend {
  categoryId: string;
  name: string;
  key?: DefaultCategoryKey;
  color?: string;
  icon?: string;
  months: CategoryTrendMonth[];
}

export interface CategoryTrendsResponse {
  periods: string[];
  asOf: string;
  categories: CategoryTrend[];
}
