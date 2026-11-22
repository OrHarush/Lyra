import ArrowDropDownSharpIcon from '@mui/icons-material/ArrowDropDownSharp';
import ArrowDropUpSharpIcon from '@mui/icons-material/ArrowDropUpSharp';
import { Collapse, IconButton, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import TextInput from '@/components/shared/inputs/TextInput';
import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';

interface AdvancedUnitsSectionProps {
  hasInitialValue: boolean;
}

const AdvancedUnitsSection = ({ hasInitialValue }: AdvancedUnitsSectionProps) => {
  const { t } = useTranslation('investments');
  const [isExpanded, setIsExpanded] = useState(hasInitialValue);

  const toggleExpanded = () => setIsExpanded(previous => !previous);

  return (
    <Column sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 1.5, py: 1 }}>
      <Row alignItems="center" justifyContent="space-between" onClick={toggleExpanded} sx={{ cursor: 'pointer' }}>
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{t('dialog.advanced')}</Typography>
        <IconButton size="small" aria-expanded={isExpanded}>
          {isExpanded ? <ArrowDropUpSharpIcon /> : <ArrowDropDownSharpIcon />}
        </IconButton>
      </Row>
      <Collapse in={isExpanded} unmountOnExit>
        <Column spacing={0.5} sx={{ pt: 1, pb: 0.5 }}>
          <TextInput
            name="units"
            label={t('dialog.units')}
            type="number"
            rules={{ validate: value => value == null || value > 0 || 'validation.mustBePositive' }}
          />
          <Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            {t('dialog.unitsHelp')}
          </Typography>
        </Column>
      </Collapse>
    </Column>
  );
};

export default AdvancedUnitsSection;
