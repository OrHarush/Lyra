import { useSearchParams } from 'react-router-dom';

import { ROUTES } from '@/constants/Routes';
import CalculatorsHubPage from '@/pages/PublicCalculators/CalculatorsHubPage';
import PublicCalculatorRoute from '@/pages/PublicCalculators/PublicCalculatorRoute';

const LEGACY_COMPOUND_INTEREST_TAB = 'compound-interest';

// Signed-in visitors with an old /calculators?tab=… bookmark land on the matching in-app tool.
const CalculatorsHubRoute = () => {
  const [searchParams] = useSearchParams();

  const toolsRoute =
    searchParams.get('tab') === LEGACY_COMPOUND_INTEREST_TAB
      ? ROUTES.TOOLS_COMPOUND_INTEREST_URL
      : ROUTES.TOOLS_NET_SALARY_URL;

  return (
    <PublicCalculatorRoute toolsRoute={toolsRoute}>
      <CalculatorsHubPage />
    </PublicCalculatorRoute>
  );
};

export default CalculatorsHubRoute;
