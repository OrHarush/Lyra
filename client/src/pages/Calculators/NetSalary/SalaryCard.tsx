import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

import TextInput from '@/components/shared/inputs/TextInput';
import AdvancedSection from '@/pages/Calculators/components/AdvancedSection';
import CalculatorCard from '@/pages/Calculators/components/CalculatorCard';
import FieldGrid from '@/pages/Calculators/components/FieldGrid';
import CreditPointsFields from '@/pages/Calculators/NetSalary/CreditPointsFields';
import SexToggle from '@/pages/Calculators/NetSalary/SexToggle';

interface SalaryCardProps {
  creditPoints: number;
}

const SalaryCard = ({ creditPoints }: SalaryCardProps) => {
  const { t } = useTranslation('calculators');

  return (
    <CalculatorCard
      title={t('netSalary.salaryTitle')}
      icon={<PaymentsOutlinedIcon color="primary" fontSize="small" />}
      action={
        <Chip
          size="small"
          color="primary"
          variant="outlined"
          label={t('netSalary.creditPointsChip', { points: Number(creditPoints.toFixed(2)) })}
        />
      }
    >
      <FieldGrid keepColumnsOnMobile>
        <TextInput
          name="grossSalary"
          label={t('netSalary.grossSalary')}
          type="number"
          min={0}
          thousandSeparators
        />
        <SexToggle />
      </FieldGrid>
      <AdvancedSection label={t('netSalary.creditPointsAdvanced')}>
        <CreditPointsFields />
      </AdvancedSection>
    </CalculatorCard>
  );
};

export default SalaryCard;
