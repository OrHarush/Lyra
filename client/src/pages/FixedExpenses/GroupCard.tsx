import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { ButtonBase, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import CoinIcon from '@/components/features/fixedExpenses/CoinIcon';
import FixedExpenseIcon from '@/components/features/fixedExpenses/FixedExpenseIcon';
import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import { getGroupCardStyle, GROUP_ICON_SIZE } from '@/pages/FixedExpenses/styles';
import { FixedExpenseGroup } from '@/utils/entities/fixedExpenseGroups';
import { GROUP_CARD_ARTWORK } from '@/utils/entities/fixedExpenseIcons';

interface GroupCardProps {
  group: FixedExpenseGroup;
  onOpen: (group: FixedExpenseGroup) => void;
}

const NAMES_SHOWN = 2;

const GroupCard = ({ group, onOpen }: GroupCardProps) => {
  const { t } = useTranslation('fixedExpenses');
  const artwork = GROUP_CARD_ARTWORK[group.id];
  const names = group.items.slice(0, NAMES_SHOWN).map(item => item.name).join(', ');

  const getSummary = () => {
    if (group.id === 'loans' && group.items.length > 1) {
      return t('groups.activeCount', { count: group.items.length });
    }

    return group.items.length > NAMES_SHOWN ? t('groups.andMore', { names }) : names;
  };

  return (
    <ButtonBase onClick={() => onOpen(group)} sx={getGroupCardStyle()}>
      <Row alignItems="center" spacing={1.5} width="100%">
        {artwork === 'coin' ? (
          <CoinIcon size={GROUP_ICON_SIZE} />
        ) : (
          <FixedExpenseIcon name={artwork} size={GROUP_ICON_SIZE} />
        )}
        <Column spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontWeight={700} noWrap>
            {t(`groups.${group.id}`)}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {getSummary()}
          </Typography>
          <Row spacing={0.5} alignItems="baseline">
            <CurrencyText value={group.monthly} variant="h6" fontWeight={700} />
            <Typography variant="caption" color="text.secondary">
              {t('groups.perMonth')}
            </Typography>
          </Row>
        </Column>
        <ChevronLeftIcon
          fontSize="small"
          sx={{
            color: 'text.secondary',
            transform: theme => (theme.direction === 'ltr' ? 'scaleX(-1)' : 'none'),
          }}
        />
      </Row>
    </ButtonBase>
  );
};

export default GroupCard;
