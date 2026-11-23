import { getLatestRates, NetSalaryBreakdown, NetSalaryFormValues } from '@lyra/shared';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import { Typography } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import AdvancedSection from '@/pages/Calculators/components/AdvancedSection';
import BreakdownRow from '@/pages/Calculators/components/BreakdownRow';
import CalculatorCard from '@/pages/Calculators/components/CalculatorCard';
import FieldGrid from '@/pages/Calculators/components/FieldGrid';
import PercentInput from '@/pages/Calculators/components/PercentInput';
import SwitchField from '@/pages/Calculators/components/SwitchField';

const SALARY_CURRENCY = 'ILS';
const STUDY_FUND_CEILING = getLatestRates().studyFund.salaryCeiling;

interface StudyFundCardProps {
  breakdown: NetSalaryBreakdown;
}

const StudyFundCard = ({ breakdown }: StudyFundCardProps) => {
  const { t } = useTranslation('calculators');
  const { control } = useFormContext<NetSalaryFormValues>();
  const hasStudyFund = useWatch({ control, name: 'hasStudyFund' });
  const hasTaxableBenefit = breakdown.studyFundTaxableBenefit > 0;

  return (
    <CalculatorCard
      title={t('netSalary.studyFundTitle')}
      icon={<SchoolOutlinedIcon color="primary" fontSize="small" />}
      action={<SwitchField name="hasStudyFund" label={t('netSalary.studyFundEnabled')} />}
    >
      <FieldGrid keepColumnsOnMobile>
        <PercentInput
          name="studyFundEmployeePct"
          label={t('netSalary.studyFundEmployeePct')}
          disabled={!hasStudyFund}
        />
        <PercentInput
          name="studyFundEmployerPct"
          label={t('netSalary.studyFundEmployerPct')}
          disabled={!hasStudyFund}
        />
      </FieldGrid>
      <AdvancedSection label={t('netSalary.studyFundAdvanced')}>
        <Column spacing={1.5}>
          <PercentInput
            name="studyFundInsuredSharePct"
            label={t('netSalary.studyFundInsuredShare')}
            step={1}
            disabled={!hasStudyFund}
          />
          <Column>
            <BreakdownRow
              label={t('netSalary.studyFundInsuredSalary')}
              value={breakdown.studyFundInsuredSalary}
              currency={SALARY_CURRENCY}
            />
            <BreakdownRow
              label={t('netSalary.studyFundCeiling')}
              value={STUDY_FUND_CEILING}
              currency={SALARY_CURRENCY}
            />
            {hasTaxableBenefit && (
              <BreakdownRow
                label={t('netSalary.studyFundTaxableBenefit')}
                value={breakdown.studyFundTaxableBenefit}
                currency={SALARY_CURRENCY}
              />
            )}
          </Column>
          <Typography variant="caption" color="text.secondary">
            {t(hasTaxableBenefit ? 'netSalary.studyFundAboveCeilingNote' : 'netSalary.studyFundBelowCeilingNote')}
          </Typography>
        </Column>
      </AdvancedSection>
    </CalculatorCard>
  );
};

export default StudyFundCard;
