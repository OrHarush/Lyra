import { TextField, TextFieldProps } from '@mui/material';
import { useState } from 'react';
import { RegisterOptions, useController, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';

interface TextInputProps extends Omit<TextFieldProps, 'name' | 'required'> {
  name: string;
  label?: string;
  required?: boolean | string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  rules?: RegisterOptions;
  thousandSeparators?: boolean;
}

const thousandsFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const integerFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

const formatWithCommas = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const num = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(num)) {
    return String(value);
  }

  return thousandsFormatter.format(num);
};

// Keeps digits, one leading minus and one decimal point, so typing "15000.50" is not read as 1,500,050.
const sanitizeDecimalInput = (raw: string): string => {
  const isNegative = raw.trim().startsWith('-');
  const cleaned = raw.replace(/[^\d.]/g, '');
  const [integerPart, ...decimalParts] = cleaned.split('.');
  const decimals = decimalParts.join('').slice(0, 2);
  const hasDecimalPoint = decimalParts.length > 0;
  const body = hasDecimalPoint ? `${integerPart}.${decimals}` : integerPart;

  return isNegative ? `-${body}` : body;
};

const formatDraftWithCommas = (draft: string): string => {
  const isNegative = draft.startsWith('-');
  const unsigned = isNegative ? draft.slice(1) : draft;
  const [integerPart, decimalPart] = unsigned.split('.');
  const formattedInteger = integerPart ? integerFormatter.format(Number(integerPart)) : '';
  const withDecimals = decimalPart === undefined ? formattedInteger : `${formattedInteger || '0'}.${decimalPart}`;

  return isNegative ? `-${withDecimals}` : withDecimals;
};

const parseDraftNumber = (draft: string): number | null => {
  if (draft === '' || draft === '-' || draft === '.' || draft === '-.') {
    return null;
  }

  const num = Number(draft);

  return Number.isFinite(num) ? num : null;
};

const TextInput = ({
  name,
  label = '',
  required,
  min,
  max,
  minLength,
  maxLength,
  fullWidth = true,
  type,
  rules,
  thousandSeparators = false,
  ...rest
}: TextInputProps) => {
  const { t } = useTranslation('common');
  const { control } = useFormContext();
  const [draft, setDraft] = useState<string | null>(null);

  let baseRules: RegisterOptions;

  if (type === 'number') {
    baseRules = {
      ...(required && {
        required:
          typeof required === 'string' ? required : t('validation.required', { field: label }),
      }),
      ...(min !== undefined && {
        min: { value: min, message: t('validation.min', { field: label, value: min }) },
      }),
      ...(max !== undefined && {
        max: { value: max, message: t('validation.max', { field: label, value: max }) },
      }),
    };
  } else if (type === 'date') {
    baseRules = {
      ...(required && {
        required:
          typeof required === 'string' ? required : t('validation.required', { field: label }),
      }),
    };
  } else {
    baseRules = {
      ...(required && {
        required:
          typeof required === 'string' ? required : t('validation.required', { field: label }),
      }),
      ...(minLength !== undefined && {
        minLength: {
          value: minLength,
          message: t('validation.min', { field: label, value: minLength }),
        },
      }),
      ...(maxLength !== undefined && {
        maxLength: {
          value: maxLength,
          message: t('validation.max', { field: label, value: maxLength }),
        },
      }),
    };
  }

  const finalRules = { ...baseRules, ...rules };
  const { field, fieldState } = useController({ name, control, rules: finalRules });
  const fieldError = fieldState.error?.message
    ? t(fieldState.error.message, { field: label })
    : undefined;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'number' && thousandSeparators) {
      const sanitized = sanitizeDecimalInput(event.target.value);

      setDraft(sanitized);
      field.onChange(parseDraftNumber(sanitized));
      return;
    }

    if (type === 'number') {
      const raw = event.target.value;

      field.onChange(raw === '' ? null : Number(raw));
      return;
    }

    if (type === 'date') {
      field.onChange(event.target.value === '' ? undefined : event.target.value);
      return;
    }

    field.onChange(event);
  };

  const useTextDisplay = type === 'number' && thousandSeparators;
  const displayValue = useTextDisplay
    ? draft !== null
      ? formatDraftWithCommas(draft)
      : formatWithCommas(field.value)
    : field.value ?? '';

  const finishEditing = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDraft(null);
    field.onBlur();
    rest.onBlur?.(event);
  };
  const inputType = useTextDisplay ? 'text' : type;

  return (
    <Column spacing={0.5} sx={{ minWidth: fullWidth ? 0.5 : undefined }}>
      <TextField
        variant={'filled'}
        label={label}
        {...field}
        value={displayValue}
        onChange={handleChange}
        fullWidth={fullWidth}
        helperText={fieldError}
        type={inputType}
        slotProps={{
          htmlInput: {
            ...(useTextDisplay ? { inputMode: 'decimal' as const } : {}),
            ...(min !== undefined ? { min: String(min) } : {}),
            ...(max !== undefined ? { max: String(max) } : {}),
          },
        }}
        error={!!fieldError}
        {...rest}
        onBlur={finishEditing}
      />
    </Column>
  );
};

export default TextInput;
