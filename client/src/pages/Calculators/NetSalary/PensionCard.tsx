import { SeveranceTrack } from '@lyra/shared';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import RHFSelect from '@/components/shared/inputs/RHFSelect';
import TextInput from '@/components/shared/inputs/TextInput';
import Column from '@/components/shared/layout/containers/Column';
import AdvancedSection from '@/pages/Calculators/components/AdvancedSection';
import CalculatorCard from '@/pages/Calculators/components/CalculatorCard';
import FieldGrid from '@/pages/Calculators/components/FieldGrid';
import PercentInput from '@/pages/Calculators/components/PercentInput';

const SEVERANCE_TRACKS: SeveranceTrack[] = ['regular', 'section14'];

const PensionCard = () => {
  const { t } = useTranslation('calculators');

  const severanceOptions = SEVERANCE_TRACKS.map(track => ({
    value: track,
    label: t(`netSalary.severance.${track}`),
  }));

  return (
    <CalculatorCard
      title={t('netSalary.pensionTitle')}
      icon={<SavingsOutlinedIcon color="primary" fontSize="small" />}
    >
      <FieldGrid keepColumnsOnMobile>
        <PercentInput name="employeePensionPct" label={t('netSalary.employeePensionPct')} max={30} />
        <PercentInput name="employerPensionPct" label={t('netSalary.employerPensionPct')} max={30} />
      </FieldGrid>
      <AdvancedSection label={t('netSalary.pensionAdvanced')}>
        <Column spacing={1.5}>
          <FieldGrid>
            <RHFSelect
              name="severanceTrack"
              label={t('netSalary.severanceTrack')}
              options={severanceOptions}
            />
            <TextInput
              name="annualDonations"
              label={t('netSalary.annualDonations')}
              type="number"
              min={0}
              thousandSeparators
            />
          </FieldGrid>
          <Typography variant="caption" color="text.secondary">
            {t('netSalary.otherBenefitsNote')}
          </Typography>
        </Column>
      </AdvancedSection>
    </CalculatorCard>
  );
};

export default PensionCard;
