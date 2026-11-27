import { FixedExpenseKind } from '@lyra/shared';
import { Button, Card, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import FixedExpenseThumbnail from '@/pages/FixedExpenses/FixedExpenseThumbnail';
import {
  CHARGE_ICON_SIZE,
  getPillButtonStyle,
  getPromptCardStyle,
} from '@/pages/FixedExpenses/styles';
import { FixedExpenseDto } from '@/types/FixedExpense';

interface ClassifyPromptCardProps {
  item: FixedExpenseDto;
  remaining: number;
  isSaving: boolean;
  onClassify: (item: FixedExpenseDto, kind: FixedExpenseKind) => void;
  onSkip: (item: FixedExpenseDto) => void;
}

const ClassifyPromptCard = ({
  item,
  remaining,
  isSaving,
  onClassify,
  onSkip,
}: ClassifyPromptCardProps) => {
  const { t } = useTranslation('fixedExpenses');

  const explanation = [t('classify.why'), remaining > 0 && t('classify.remaining', { count: remaining })]
    .filter(Boolean)
    .join(' ');

  return (
    <Card sx={getPromptCardStyle()}>
      <Column
        flexDirection={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        gap={2}
      >
        <Row alignItems="center" spacing={2} sx={{ flex: 1, minWidth: 0 }}>
          <FixedExpenseThumbnail item={item} size={CHARGE_ICON_SIZE} />
          <Column spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography fontWeight={700}>{t('classify.question', { name: item.name })}</Typography>
            <Typography variant="body2" color="text.secondary">
              {explanation}
            </Typography>
          </Column>
        </Row>
        <Row spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Button
            variant="contained"
            disabled={isSaving}
            onClick={() => onClassify(item, 'subscription')}
            sx={getPillButtonStyle()}
          >
            {t('classify.yesSubscription')}
          </Button>
          <Button
            variant="outlined"
            disabled={isSaving}
            onClick={() => onClassify(item, 'bill')}
            sx={getPillButtonStyle()}
          >
            {t('classify.bill')}
          </Button>
          <Button
            variant="outlined"
            disabled={isSaving}
            onClick={() => onClassify(item, 'regular')}
            sx={getPillButtonStyle()}
          >
            {t('classify.regular')}
          </Button>
          <Button color="inherit" onClick={() => onSkip(item)} sx={getPillButtonStyle()}>
            {t('classify.skip')}
          </Button>
        </Row>
      </Column>
    </Card>
  );
};

export default ClassifyPromptCard;
