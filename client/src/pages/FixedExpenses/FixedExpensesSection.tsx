import { FixedExpenseKind } from '@lyra/shared';
import { Typography } from '@mui/material';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';

interface FixedExpensesSectionProps {
  kind: FixedExpenseKind;
  children: ReactNode;
}

const FixedExpensesSection = ({ kind, children }: FixedExpensesSectionProps) => {
  const { t } = useTranslation('fixedExpenses');

  return (
    <Column spacing={1.5}>
      <Column spacing={0.25}>
        <Typography variant="h6" fontWeight={800}>
          {t(`sections.${kind}.title`)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t(`sections.${kind}.hint`)}
        </Typography>
      </Column>
      {children}
    </Column>
  );
};

export default FixedExpensesSection;
