import type {
  InvestmentHistoryPointDto,
  InvestmentPurchaseMarkerDto,
  InvestmentPurchaseViewDto,
} from '@/types/Investment';

export interface ChartPurchase extends InvestmentPurchaseMarkerDto {
  badge: string;
  valueTodayIls: number | null;
}

// Shared with the loading skeleton so the placeholder occupies exactly the space of the real chart.
export const CHART_HEIGHT = { mobile: 180, desktop: 260 } as const;

export const DENSE_DOTS_THRESHOLD = 30;
const REGULAR_DOT_RADIUS = 6;
const DENSE_DOT_RADIUS = 4;

export const getDotRadius = (dotCount: number) =>
  dotCount > DENSE_DOTS_THRESHOLD ? DENSE_DOT_RADIUS : REGULAR_DOT_RADIUS;

// A purchase on a weekend has no point of its own, so its dot rides on the next trading day.
export const groupPurchasesBySeriesDate = (
  series: InvestmentHistoryPointDto[],
  markers: InvestmentPurchaseMarkerDto[],
  views: InvestmentPurchaseViewDto[]
) => {
  const viewById = new Map(views.map(view => [view.id, view]));
  const groups = new Map<string, ChartPurchase[]>();

  for (const marker of markers) {
    const point = series.find(candidate => candidate.date >= marker.date);

    if (!point) {
      continue;
    }

    groups.set(point.date, [
      ...(groups.get(point.date) ?? []),
      {
        ...marker,
        badge: viewById.get(marker.id)?.badge ?? marker.yahooSymbol,
        valueTodayIls: viewById.get(marker.id)?.valueTodayIls ?? null,
      },
    ]);
  }

  return groups;
};
