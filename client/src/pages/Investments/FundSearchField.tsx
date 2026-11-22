import { Autocomplete, Chip, CircularProgress, InputLabel, TextField, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { useInstrumentSearch } from '@/hooks/entities/useInvestments';
import FundBadge from '@/pages/Investments/FundBadge';
import {
  fromCatalogInstrument,
  fromForeignInstrument,
  FundOption,
} from '@/pages/Investments/purchaseFormModel';
import { OTHER_FUND_COLOR } from '@/theme/investmentColors';

type GroupedOption = FundOption & { group: 'israeli' | 'foreign' };

const FundSearchField = () => {
  const { t } = useTranslation('investments');
  const { control } = useFormContext();
  const [inputValue, setInputValue] = useState('');
  const { results, isFetching } = useInstrumentSearch(inputValue);

  const options = useMemo<GroupedOption[]>(
    () => [
      ...results.israeli.map((item): GroupedOption => ({ ...fromCatalogInstrument(item), group: 'israeli' })),
      ...results.foreign.map((item): GroupedOption => ({ ...fromForeignInstrument(item), group: 'foreign' })),
    ],
    [results]
  );

  return (
    <Controller
      name="fund"
      control={control}
      rules={{ required: t('errors.fundRequired') }}
      render={({ field, fieldState }) => (
        <Column spacing={0.5}>
          <InputLabel>{t('dialog.fund')}</InputLabel>
          <Autocomplete<GroupedOption>
            value={field.value as GroupedOption | null}
            options={options}
            loading={isFetching}
            filterOptions={items => items}
            groupBy={option => t(`dialog.groups.${option.group}`)}
            getOptionLabel={option => `${option.badge} · ${option.name}`}
            isOptionEqualToValue={(option, value) =>
              option.source === value.source && option.instrumentId === value.instrumentId
            }
            noOptionsText={t('dialog.noOptions')}
            onChange={(_, option) => field.onChange(option)}
            onInputChange={(_, value, reason) => reason === 'input' && setInputValue(value)}
            renderOption={({ key: _key, ...optionProps }, option) => (
              <li key={`${option.source}:${option.instrumentId}`} {...optionProps}>
                <Row spacing={1.5} alignItems="center" sx={{ width: '100%', minWidth: 0 }}>
                  <FundBadge label={option.badge} color={OTHER_FUND_COLOR} />
                  <Column sx={{ minWidth: 0, flex: 1 }}>
                    <Typography noWrap sx={{ fontSize: '0.875rem' }}>
                      {option.name}
                    </Typography>
                    {option.exchange && (
                      <Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {option.exchange}
                      </Typography>
                    )}
                  </Column>
                  {option.isHedged && (
                    <Chip size="small" variant="outlined" label={t('dialog.hedged')} />
                  )}
                </Row>
              </li>
            )}
            renderInput={params => (
              <TextField
                {...params}
                size="small"
                placeholder={t('dialog.fundPlaceholder')}
                inputRef={field.ref}
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message ??
                  (results.foreignUnavailable ? t('dialog.foreignUnavailable') : undefined)
                }
                slotProps={{
                  input: {
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isFetching && <CircularProgress size={16} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  },
                }}
              />
            )}
          />
        </Column>
      )}
    />
  );
};

export default FundSearchField;
