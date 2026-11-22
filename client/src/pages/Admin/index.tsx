import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Collapse, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import PageLayout from '@/components/shared/layout/page/PageLayout';
import { usePageHeader } from '@/components/shared/layout/PageHeaderContext';

import ActivityFeed from './ActivityFeed';
import AdminDashboardSkeleton from './AdminDashboardSkeleton';
import AdminStatCard from './AdminStatCard';
import CopySnapshotButton from './CopySnapshotButton';
import DownloadBackupButton from './DownloadBackupButton';
import FunnelBar from './FunnelBar';
import RetentionSection from './RetentionSection';
import { useAdminAnalytics } from './useAdminAnalytics';
import UsersTable from './UsersTable';

export const AdminDashboard = () => {
  const { t } = useTranslation('admin');
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  usePageHeader(t('title'));

  const { data, isLoading, isError, funnel, funnelMax, adoption, adoptionMax } =
    useAdminAnalytics();

  const [funnelOpen, setFunnelOpen] = useState(isDesktop);
  const [adoptionOpen, setAdoptionOpen] = useState(isDesktop);
  const [retentionOpen, setRetentionOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(true);
  const [usersOpen, setUsersOpen] = useState(isDesktop);

  if (isLoading || !data) {
    return (
      <PageLayout hasNaturalHeight spacing={3}>
        <AdminDashboardSkeleton />
      </PageLayout>
    );
  }

  if (isError) {
    return (
      <PageLayout hasNaturalHeight spacing={3}>
        <Column sx={{ alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          <Typography color="error">Failed to load analytics</Typography>
        </Column>
      </PageLayout>
    );
  }

  const newTodayBadge =
    data.newUsersToday > 0
      ? { text: t('users.badge', { count: data.newUsersToday }), color: 'success' }
      : undefined;

  const activatedPct =
    data.totalUsers > 0 ? `${Math.round((data.activatedUsers / data.totalUsers) * 100)}%` : '0%';

  return (
    <PageLayout hasNaturalHeight spacing={3}>
      {isDesktop ? (
        <Column spacing={1}>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5 }}>
            {t('activity.title').toUpperCase()}
          </Typography>
          <Row spacing={2}>
            <Box sx={{ flex: 1 }}>
              <AdminStatCard label={t('activity.title')} value={data.dau} sub={t('activity.sub')} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <AdminStatCard
                label={t('activity.wau')}
                value={data.wau}
                sub={t('activity.wauSub')}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <AdminStatCard
                label={t('activity.mau')}
                value={data.mau}
                sub={t('activity.mauSub')}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <AdminStatCard
                label={t('activity.total')}
                value={data.totalUsers}
                sub={t('activity.totalSub')}
              />
            </Box>
          </Row>
        </Column>
      ) : (
        <Column spacing={1}>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5 }}>
            {t('activity.title').toUpperCase()}
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <AdminStatCard label={t('activity.title')} value={data.dau} sub={t('activity.sub')} />
            <AdminStatCard label={t('activity.wau')} value={data.wau} sub={t('activity.wauSub')} />
            <AdminStatCard label={t('activity.mau')} value={data.mau} sub={t('activity.mauSub')} />
            <AdminStatCard
              label={t('activity.total')}
              value={data.totalUsers}
              sub={t('activity.totalSub')}
            />
          </Box>
        </Column>
      )}

      {/* New users row */}
      {isDesktop ? (
        <Column spacing={1}>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5 }}>
            {t('users.sectionTitle').toUpperCase()}
          </Typography>
          <Row spacing={2}>
            <Box sx={{ flex: 1 }}>
              <AdminStatCard
                label={t('users.today')}
                value={data.newUsersToday}
                sub={t('users.todaySub')}
                badge={newTodayBadge}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <AdminStatCard
                label={t('users.thisWeek')}
                value={data.newUsersThisWeek}
                sub={t('users.thisWeekSub')}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <AdminStatCard
                label={t('users.thisMonth')}
                value={data.newUsersThisMonth}
                sub={t('users.thisMonthSub')}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <AdminStatCard
                label={t('users.activated')}
                value={data.activatedUsers}
                badge={{ text: activatedPct, color: 'success' }}
              />
            </Box>
          </Row>
        </Column>
      ) : (
        <Column spacing={1}>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5 }}>
            {t('users.sectionTitle').toUpperCase()}
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <AdminStatCard
              label={t('users.today')}
              value={data.newUsersToday}
              badge={newTodayBadge}
            />
            <AdminStatCard
              label={t('users.thisWeek')}
              value={data.newUsersThisWeek}
              sub={t('users.thisWeekSub')}
            />
            <AdminStatCard
              label={t('users.thisMonth')}
              value={data.newUsersThisMonth}
              sub={t('users.thisMonthSub')}
            />
            <AdminStatCard
              label={t('users.activated')}
              value={data.activatedUsers}
              badge={{ text: activatedPct, color: 'success' }}
            />
          </Box>
        </Column>
      )}

      {/* Funnel + Adoption */}
      {isDesktop ? (
        <Row spacing={2} sx={{ '& > *': { flex: 1 } }}>
          <SectionCard title={t('funnel.title')}>
            <Column spacing={1.5}>
              {funnel.map(row => (
                <FunnelBar
                  key={row.labelKey}
                  label={t(row.labelKey)}
                  value={row.value}
                  max={funnelMax}
                  color={row.color}
                />
              ))}
            </Column>
          </SectionCard>

          <SectionCard title={t('adoption.title')}>
            <Column spacing={1.5}>
              {adoption.map(row => (
                <FunnelBar
                  key={row.labelKey}
                  label={t(row.labelKey)}
                  value={row.value}
                  max={adoptionMax}
                  color={row.color}
                />
              ))}
            </Column>
          </SectionCard>
        </Row>
      ) : (
        <Column spacing={2}>
          <CollapsibleSection
            title={t('funnel.title')}
            open={funnelOpen}
            onToggle={() => setFunnelOpen(v => !v)}
          >
            <Column spacing={1.5}>
              {funnel.map(row => (
                <FunnelBar
                  key={row.labelKey}
                  label={t(row.labelKey)}
                  value={row.value}
                  max={funnelMax}
                  color={row.color}
                />
              ))}
            </Column>
          </CollapsibleSection>

          <CollapsibleSection
            title={t('adoption.title')}
            open={adoptionOpen}
            onToggle={() => setAdoptionOpen(v => !v)}
          >
            <Column spacing={1.5}>
              {adoption.map(row => (
                <FunnelBar
                  key={row.labelKey}
                  label={t(row.labelKey)}
                  value={row.value}
                  max={adoptionMax}
                  color={row.color}
                />
              ))}
            </Column>
          </CollapsibleSection>
        </Column>
      )}

      {/* Retention */}
      <CollapsibleSection
        title={t('retention.title')}
        open={retentionOpen}
        onToggle={() => setRetentionOpen(v => !v)}
      >
        <RetentionSection />
      </CollapsibleSection>

      <Row justifyContent="center" spacing={1.5}>
        <CopySnapshotButton />
        <DownloadBackupButton />
      </Row>

      {/* Divider */}
      <Box sx={{ borderTop: 1, borderColor: 'divider' }} />

      {/* All Users */}
      {isDesktop ? (
        <SectionCard title={t('allUsers.title')}>
          <UsersTable />
        </SectionCard>
      ) : (
        <CollapsibleSection
          title={t('allUsers.title')}
          open={usersOpen}
          onToggle={() => setUsersOpen(v => !v)}
        >
          <UsersTable />
        </CollapsibleSection>
      )}

      {/* Recent Activity */}
      {isDesktop ? (
        <SectionCard title={t('recent.title')}>
          <ActivityFeed />
        </SectionCard>
      ) : (
        <CollapsibleSection
          title={t('recent.title')}
          open={activityOpen}
          onToggle={() => setActivityOpen(v => !v)}
        >
          <ActivityFeed />
        </CollapsibleSection>
      )}
    </PageLayout>
  );
};

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box
    sx={{
      bgcolor: 'background.paper',
      borderRadius: 2,
      border: 1,
      borderColor: 'divider',
      overflow: 'hidden',
    }}
  >
    <Typography
      variant="caption"
      sx={{ fontWeight: 700, letterSpacing: 1.5, px: 2, pt: 2, display: 'block' }}
    >
      {title.toUpperCase()}
    </Typography>
    <Box sx={{ p: 2 }}>{children}</Box>
  </Box>
);

const CollapsibleSection = ({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => (
  <Box
    sx={{
      bgcolor: 'background.paper',
      borderRadius: 2,
      border: 1,
      borderColor: 'divider',
      overflow: 'hidden',
    }}
  >
    <Row
      alignItems="center"
      justifyContent="space-between"
      sx={{ px: 2, py: 1.5, cursor: 'pointer' }}
      onClick={onToggle}
    >
      <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5 }}>
        {title.toUpperCase()}
      </Typography>
      <IconButton
        size="small"
        sx={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
      >
        <ExpandMoreIcon fontSize="small" />
      </IconButton>
    </Row>
    <Collapse in={open} timeout="auto" unmountOnExit>
      <Box sx={{ px: 2, pb: 2 }}>{children}</Box>
    </Collapse>
  </Box>
);
