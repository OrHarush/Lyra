import type { ChartPurchase } from '@/pages/Investments/chartModel';
import { FundColor, OTHER_FUND_COLOR } from '@/theme/investmentColors';

interface PurchaseDotsProps {
  cx?: number;
  cy?: number;
  purchases: ChartPurchase[];
  colors: Map<string, FundColor>;
  radius: number;
  ringColor: string;
}

const RING_WIDTH = 2;
const OVERLAP_OFFSET = 8;

// Same-day purchases would draw on top of each other, so they fan out sideways.
const PurchaseDots = ({ cx, cy, purchases, colors, radius, ringColor }: PurchaseDotsProps) => {
  if (cx === undefined || cy === undefined) {
    return <g />;
  }

  return (
    <g>
      {purchases.map((purchase, index) => (
        <circle
          key={purchase.id}
          cx={cx + (index - (purchases.length - 1) / 2) * OVERLAP_OFFSET}
          cy={cy}
          r={radius}
          fill={(colors.get(purchase.yahooSymbol) ?? OTHER_FUND_COLOR).main}
          stroke={ringColor}
          strokeWidth={RING_WIDTH}
        />
      ))}
    </g>
  );
};

export default PurchaseDots;
