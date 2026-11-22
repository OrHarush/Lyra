import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  alpha,
  Badge,
  ButtonBase,
  Checkbox,
  Divider,
  FormControlLabel,
  Popover,
  Typography,
} from '@mui/material';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { useOpen } from '@/hooks/common/useOpen';
import FundBadge from '@/pages/Investments/FundBadge';
import { FundColor, OTHER_FUND_COLOR } from '@/theme/investmentColors';
import type { InvestmentFundDto } from '@/types/Investment';

interface FundFilterDropdownProps {
  funds: InvestmentFundDto[];
  colors: Map<string, FundColor>;
  selectedSymbols: string[];
  isAllSelected: boolean;
  onSelectAll: () => void;
  onToggleFund: (symbol: string) => void;
}

const TRIGGER_HEIGHT = 36;

const FundFilterDropdown = ({
  funds,
  colors,
  selectedSymbols,
  isAllSelected,
  onSelectAll,
  onToggleFund,
}: FundFilterDropdownProps) => {
  const { t } = useTranslation('investments');
  const [isOpen, openMenu, closeMenu] = useOpen();
  const anchorRef = useRef<HTMLButtonElement>(null);

  const label = isAllSelected
    ? t('filter.allFunds')
    : funds
        .filter(fund => selectedSymbols.includes(fund.yahooSymbol))
        .map(fund => fund.badge)
        .join(', ');

  return (
    <>
      <ButtonBase
        ref={anchorRef}
        onClick={openMenu}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        sx={theme => ({
          height: TRIGGER_HEIGHT,
          px: 1.5,
          gap: 1,
          borderRadius: '12px',
          bgcolor: alpha(theme.palette.text.secondary, 0.08),
          maxWidth: 220,
        })}
      >
        <Typography noWrap dir="ltr" sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
          {label}
        </Typography>
        <Badge
          badgeContent={selectedSymbols.length}
          color="primary"
          sx={{ '& .MuiBadge-badge': { position: 'static', transform: 'none' } }}
        />
        <ExpandMoreIcon fontSize="small" />
      </ButtonBase>
      <Popover
        open={isOpen}
        anchorEl={anchorRef.current}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { borderRadius: '12px', mt: 0.5, minWidth: 240, p: 1 } } }}
      >
        <Column>
          <FormControlLabel
            label={t('filter.allFunds')}
            control={<Checkbox checked={isAllSelected} onChange={onSelectAll} />}
          />
          <Divider sx={{ my: 0.5 }} />
          {funds.map(fund => (
            <FormControlLabel
              key={fund.yahooSymbol}
              control={
                <Checkbox
                  checked={selectedSymbols.includes(fund.yahooSymbol)}
                  onChange={() => onToggleFund(fund.yahooSymbol)}
                />
              }
              label={
                <Row spacing={1} alignItems="center">
                  <FundBadge label={fund.badge} color={colors.get(fund.yahooSymbol) ?? OTHER_FUND_COLOR} />
                  <Typography noWrap sx={{ fontSize: '0.8125rem', maxWidth: 160 }}>
                    {fund.displayName}
                  </Typography>
                </Row>
              }
            />
          ))}
        </Column>
      </Popover>
    </>
  );
};

export default FundFilterDropdown;
