import type { HistoryRangeValue } from '@lyra/shared';
import { ButtonBase } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Row from '@/components/shared/layout/containers/Row';
import { getRangeOptionStyle, getRangeSegmentsStyle } from '@/pages/Investments/styles';

interface RangeChipsProps {
  range: HistoryRangeValue;
  onChange: (range: HistoryRangeValue) => void;
}

const RANGES: HistoryRangeValue[] = ['3M', '1Y', 'ALL'];

const RangeChips = ({ range, onChange }: RangeChipsProps) => {
  const { t } = useTranslation('investments');

  return (
    <Row spacing={0.5} sx={getRangeSegmentsStyle()}>
      {RANGES.map(option => (
        <ButtonBase
          key={option}
          aria-pressed={range === option}
          onClick={() => onChange(option)}
          sx={getRangeOptionStyle(range === option)}
        >
          {t(`chart.range.${option}`)}
        </ButtonBase>
      ))}
    </Row>
  );
};

export default RangeChips;
