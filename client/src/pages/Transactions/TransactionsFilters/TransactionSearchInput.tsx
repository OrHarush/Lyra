import SearchIcon from '@mui/icons-material/Search';
import { IconButton, InputAdornment } from '@mui/material';
import { ClearIcon } from '@mui/x-date-pickers';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import TextInput from '@/components/shared/inputs/TextInput';
import { TransactionPageFormValues } from '@/types/Transaction';

const TransactionSearchInput = () => {
  const { t } = useTranslation('common');
  const { control, setValue } = useFormContext<TransactionPageFormValues>();
  const searchValue = useWatch({ control, name: 'searchValue' });

  return (
    <TextInput
      variant={'outlined'}
      name="searchValue"
      placeholder={t('actions.search')}
      value={searchValue}
      size="small"
      fullWidth={false}
      sx={{
        width: { xs: '100%', md: 240 },
        '& .MuiOutlinedInput-root': { borderRadius: { md: '999px' } },
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchValue && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setValue('searchValue', '')} edge="end">
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default TransactionSearchInput;
