import { getLatestRates, resolveRates } from '@lyra/shared';
import { useEffect, useState } from 'react';

import { getIsraelToday } from '@/utils/israelToday';

// Resolved after mount so prerendered HTML (built on one date) matches the first client render.
export const useRatesFreshness = () => {
  const [isCurrent, setIsCurrent] = useState(true);

  useEffect(() => {
    setIsCurrent(resolveRates(getIsraelToday()).isCurrent);
  }, []);

  return { isCurrent, ratesYear: getLatestRates().ratesYear };
};
