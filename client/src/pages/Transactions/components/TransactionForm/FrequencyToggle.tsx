import { useTranslation } from 'react-i18next';

import RHFToggleGroup from '@/components/shared/inputs/RHFToggleGroup';

const FREQUENCY_VALUES = ['None', 'Monthly', 'Bimonthly', 'Yearly'] as const;

const FrequencyToggle = () => {
  const { t } = useTranslation('transactions');

  return (
    <RHFToggleGroup
      name="recurrence"
      label={t('fields.recurrence')}
      options={FREQUENCY_VALUES.map(value => ({
        value,
        label: t(`recurrence.${value.toLowerCase() as Lowercase<typeof value>}`),
      }))}
    />
  );
};

export default FrequencyToggle;
