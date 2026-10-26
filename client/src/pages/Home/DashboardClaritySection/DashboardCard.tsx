import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { alpha, Card, Divider, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

import BalanceHeadline from '@/components/features/overview/BalanceHeadline';
import IncomeUsageMeter from '@/components/features/overview/IncomeUsageMeter';
import OverviewMetric from '@/components/features/overview/OverviewMetric';
import ProjectedBalanceBreakdown from '@/components/features/overview/ProjectedBalanceBreakdown';
import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { CLARITY_FIGURES } from '@/pages/Home/DashboardClaritySection/constants';
import PhoneCalendarBlock from '@/pages/Home/DashboardClaritySection/PhoneCalendarBlock';

const DashboardCard = () => {
  const theme = useTheme();
  const { t } = useTranslation('overview');
  const { t: tHome } = useTranslation('home');

  const projectedTooltip = (
    <ProjectedBalanceBreakdown
      balance={CLARITY_FIGURES.balance}
      futureIncome={CLARITY_FIGURES.breakdown.futureIncome}
      futureExpenses={CLARITY_FIGURES.breakdown.futureExpenses}
      pendingPriorExpenses={CLARITY_FIGURES.breakdown.pendingPriorExpenses}
      projected={CLARITY_FIGURES.projected}
    />
  );

  return (
    <Column spacing={2}>
      <Row justifyContent="center" alignItems="center" spacing={1.5}>
        <ChevronRightIcon sx={{ fontSize: '1.1rem', color: 'text.secondary' }} />
        <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, color: 'text.primary' }}>
          {tHome('landing.clarity.month')}
        </Typography>
        <ChevronLeftIcon sx={{ fontSize: '1.1rem', color: 'text.secondary' }} />
      </Row>

      <Card sx={{ p: 2 }}>
        <Column spacing={2}>
          <Row
            alignItems="center"
            justifyContent="space-between"
            sx={{
              alignSelf: 'start',
              width: 180,
              height: 36,
              px: 1.25,
              borderRadius: '8px',
              backgroundColor: alpha(theme.palette.background.paper, 0.4),
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Row spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
              <AccountBalanceWalletIcon sx={{ fontSize: '1rem', flexShrink: 0 }} />
              <Typography
                sx={{
                  fontSize: '0.85rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {tHome('landing.clarity.account')}
              </Typography>
            </Row>
            <KeyboardArrowDownIcon sx={{ fontSize: '1.1rem', color: 'text.secondary' }} />
          </Row>

          <Row spacing={1} alignItems="center" justifyContent="space-evenly">
            <BalanceHeadline balance={CLARITY_FIGURES.balance} label={t('general.balance')} />
            <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: 'divider' }} />
            <BalanceHeadline
              balance={CLARITY_FIGURES.projected}
              label={t('general.projectedBalance')}
              tooltip={projectedTooltip}
              valueColor="primary.main"
            />
          </Row>

          <Column spacing={1}>
            <Row spacing={2} justifyContent="space-evenly">
              <OverviewMetric
                icon={TrendingUpIcon}
                value={CLARITY_FIGURES.income}
                label={t('general.income')}
                color="success"
              />
              <OverviewMetric
                icon={TrendingDownIcon}
                value={CLARITY_FIGURES.expenses}
                label={t('general.expenses')}
                color="error"
              />
            </Row>
            <IncomeUsageMeter income={CLARITY_FIGURES.income} expenses={CLARITY_FIGURES.expenses} />
          </Column>
        </Column>
      </Card>

      <PhoneCalendarBlock />
    </Column>
  );
};

export default DashboardCard;
