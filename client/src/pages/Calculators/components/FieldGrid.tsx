import { ReactNode } from 'react';

import Column from '@/components/shared/layout/containers/Column';
import { getFieldGridStyle } from '@/pages/Calculators/styles';

interface FieldGridProps {
  children: ReactNode;
  columns?: number;
  keepColumnsOnMobile?: boolean;
}

const FieldGrid = ({ children, columns = 2, keepColumnsOnMobile = false }: FieldGridProps) => (
  <Column sx={getFieldGridStyle(columns, keepColumnsOnMobile)}>{children}</Column>
);

export default FieldGrid;
