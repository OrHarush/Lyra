import { ReactNode } from 'react';

import Column from '@/components/shared/layout/containers/Column';
import { getEmbedStyle } from '@/pages/PublicCalculators/styles';

interface CalculatorEmbedProps {
  children: ReactNode;
  hasFixedHeight?: boolean;
}

// The net salary layout fills its parent's height, so on wide screens it needs a definite one.
const CalculatorEmbed = ({ children, hasFixedHeight = false }: CalculatorEmbedProps) => (
  <Column sx={getEmbedStyle(hasFixedHeight)}>{children}</Column>
);

export default CalculatorEmbed;
