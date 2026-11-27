import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { ButtonBase, IconButton, Popover, Typography } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import dayjs, { Dayjs } from 'dayjs';
import { MouseEvent, useState } from 'react';

import Row from '@/components/shared/layout/containers/Row';
import MonthGridPanel from '@/components/shared/ui/MonthDateSelector/MonthGridPanel';
import { useMonthLabels } from '@/hooks/common/useMonthsLabels';

interface DateSelectorProps {
  value: Dayjs;
  onChange: (newDate: Dayjs) => void;
}

const flipIconForRtl = (theme: Theme) =>
  theme.direction === 'rtl' ? 'scaleX(-1)' : 'none';

const MAX_YEAR = dayjs().year();
const MIN_YEAR = MAX_YEAR - 5;

const MonthDateSelector = ({ value, onChange }: DateSelectorProps) => {
  const monthLabels = useMonthLabels();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const formattedMonth = `${monthLabels[value.month()]} ${value.year()}`;

  const nextMonth = value.add(1, 'month').startOf('month');
  const prevMonth = value.subtract(1, 'month').startOf('month');
  const isNextDisabled = nextMonth.year() > MAX_YEAR;
  const isPrevDisabled = prevMonth.year() < MIN_YEAR;

  const goToPrevMonth = () => onChange(prevMonth);
  const goToNextMonth = () => onChange(nextMonth);

  const openMonthPanel = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMonthPanel = () => setAnchorEl(null);

  const selectMonth = (year: number, monthIndex: number) => {
    onChange(value.year(year).month(monthIndex).startOf('month'));
    closeMonthPanel();
  };

  return (
    <>
      <Row width="160px" alignItems="center" justifyContent="space-between">
        <IconButton
          onClick={goToPrevMonth}
          size="small"
          color="primary"
          disabled={isPrevDisabled}
        >
          <ArrowBackIosNewIcon fontSize="small" sx={{ transform: flipIconForRtl }} />
        </IconButton>
        <ButtonBase
          onClick={openMonthPanel}
          sx={{ borderRadius: 1, px: 0.5, py: 0.25 }}
        >
          <Typography variant="body1" fontWeight={600}>
            {formattedMonth}
          </Typography>
        </ButtonBase>
        <IconButton
          onClick={goToNextMonth}
          size="small"
          color="primary"
          disabled={isNextDisabled}
        >
          <ArrowForwardIosIcon fontSize="small" sx={{ transform: flipIconForRtl }} />
        </IconButton>
      </Row>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={closeMonthPanel}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MonthGridPanel
          value={value}
          minYear={MIN_YEAR}
          maxYear={MAX_YEAR}
          onSelect={selectMonth}
        />
      </Popover>
    </>
  );
};

export default MonthDateSelector;
