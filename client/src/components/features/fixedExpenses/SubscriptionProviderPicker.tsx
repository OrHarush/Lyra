import { FixedExpenseDetailsDTO, listSubscriptionProviders, SubscriptionProviderId } from '@lyra/shared';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Chip, InputAdornment, Typography } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import OptionChip from '@/components/features/fixedExpenses/OptionChip';
import ProviderInitial from '@/components/features/fixedExpenses/ProviderInitial';
import { getChipRowStyle } from '@/components/features/fixedExpenses/styles';
import TextInput from '@/components/shared/inputs/TextInput';
import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { getProviderCancelUrl, getProviderName } from '@/utils/entities/fixedExpense';

type ProviderFormValues = FixedExpenseDetailsDTO & { name?: string };

interface SubscriptionProviderPickerProps {
  canFillName?: boolean;
}

const PROVIDERS = listSubscriptionProviders();

const SubscriptionProviderPicker = ({ canFillName = false }: SubscriptionProviderPickerProps) => {
  const { t, i18n } = useTranslation('transactions');
  const { control, getValues, setValue } = useFormContext<ProviderFormValues>();
  const providerId = useWatch({ control, name: 'providerId' });
  const cancelUrl = useWatch({ control, name: 'cancelUrl' });
  const providerUrl = getProviderCancelUrl(providerId);
  const isAutoFilled = !!providerUrl && cancelUrl === providerUrl;

  // Fills in what the user hasn't typed themselves, so switching providers never wipes their edits.
  const pickProvider = (nextId?: SubscriptionProviderId) => {
    const previousName = providerId ? getProviderName(providerId, i18n.language) : '';
    const previousUrl = getProviderCancelUrl(providerId) ?? '';

    setValue('providerId', nextId, { shouldDirty: true });

    if (canFillName && nextId && [undefined, '', previousName].includes(getValues('name'))) {
      setValue('name', getProviderName(nextId, i18n.language), { shouldDirty: true, shouldValidate: true });
    }

    if ([undefined, '', previousUrl].includes(getValues('cancelUrl'))) {
      setValue('cancelUrl', getProviderCancelUrl(nextId) ?? '', { shouldDirty: true, shouldValidate: true });
    }
  };

  return (
    <Column spacing={1.5}>
      <Column spacing={0.75}>
        <Typography variant="caption" color="text.secondary">
          {t('fixedExpense.provider')}
        </Typography>
        <Row spacing={1} sx={getChipRowStyle()}>
          {PROVIDERS.map(provider => {
            const name = getProviderName(provider.id as SubscriptionProviderId, i18n.language);

            return (
              <OptionChip
                key={provider.id}
                label={name}
                icon={<ProviderInitial name={name} />}
                isSelected={providerId === provider.id}
                onClick={() => pickProvider(provider.id as SubscriptionProviderId)}
              />
            );
          })}
          <OptionChip
            label={t('fixedExpense.otherProvider')}
            icon={<MoreHorizIcon sx={{ fontSize: 18 }} />}
            isSelected={!providerId}
            onClick={() => pickProvider(undefined)}
          />
        </Row>
      </Column>
      <TextInput
        name="cancelUrl"
        label={t('fixedExpense.cancelUrl')}
        placeholder="https://"
        maxLength={500}
        slotProps={{
          htmlInput: { dir: 'ltr', inputMode: 'url' },
          input: {
            endAdornment: isAutoFilled && (
              <InputAdornment position="end">
                <Chip size="small" color="success" variant="outlined" label={t('fixedExpense.autoFilled')} />
              </InputAdornment>
            ),
          },
        }}
      />
    </Column>
  );
};

export default SubscriptionProviderPicker;
