import {
  Avatar,
  Box,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { AdminUserDto } from '@/types/Admin';

import { useAdminUsers } from './useAdminUsers';

dayjs.extend(relativeTime);

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  return (name[0] ?? '').toUpperCase();
};

const formatDate = (iso: string | undefined): string => {
  if (!iso) {
    return '—';
  }

  return dayjs(iso).format('DD MMM YYYY');
};

const formatRelative = (iso: string | undefined): string => {
  if (!iso) {
    return '—';
  }

  return dayjs(iso).fromNow();
};

const matchesSearch = (user: AdminUserDto, term: string): boolean => {
  const lower = term.toLowerCase();

  return user.name.toLowerCase().includes(lower) || user.email.toLowerCase().includes(lower);
};

type SortKey = 'createdAt' | 'lastActiveAt' | 'totalTransactions';
type SortDirection = 'asc' | 'desc';

const getSortValue = (user: AdminUserDto, key: SortKey): number => {
  if (key === 'totalTransactions') {
    return user.totalTransactions;
  }

  const iso = user[key];

  if (!iso) {
    return key === 'lastActiveAt' ? -Infinity : 0;
  }

  return new Date(iso).getTime();
};

const UsersTable = () => {
  const { t } = useTranslation('admin');
  const { data, isLoading } = useAdminUsers();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));

      return;
    }

    setSortKey(key);
    setSortDirection('desc');
  };

  const filtered = useMemo(() => {
    if (!data) {
      return [];
    }

    const term = search.trim();
    const base = term ? data.filter(u => matchesSearch(u, term)) : data;

    const sorted = [...base].sort((a, b) => getSortValue(a, sortKey) - getSortValue(b, sortKey));

    if (sortDirection === 'desc') {
      sorted.reverse();
    }

    return sorted;
  }, [data, search, sortKey, sortDirection]);

  if (isLoading || !data) {
    return (
      <Column spacing={1}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={48} />
        ))}
      </Column>
    );
  }

  return (
    <Column spacing={2}>
      <Row alignItems="center" justifyContent="space-between" sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {t('allUsers.count', { count: filtered.length, total: data.length })}
        </Typography>
        <TextField
          size="small"
          placeholder={t('allUsers.searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ minWidth: 220 }}
        />
      </Row>

      <TableContainer sx={{ maxHeight: 560 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>{t('allUsers.user')}</TableCell>
              <TableCell>{t('allUsers.email')}</TableCell>
              <TableCell sortDirection={sortKey === 'createdAt' ? sortDirection : false}>
                <TableSortLabel
                  active={sortKey === 'createdAt'}
                  direction={sortKey === 'createdAt' ? sortDirection : 'desc'}
                  onClick={() => toggleSort('createdAt')}
                >
                  {t('allUsers.registered')}
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="center"
                sortDirection={sortKey === 'totalTransactions' ? sortDirection : false}
              >
                <TableSortLabel
                  active={sortKey === 'totalTransactions'}
                  direction={sortKey === 'totalTransactions' ? sortDirection : 'desc'}
                  onClick={() => toggleSort('totalTransactions')}
                >
                  {t('allUsers.transactions')}
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortKey === 'lastActiveAt' ? sortDirection : false}>
                <TableSortLabel
                  active={sortKey === 'lastActiveAt'}
                  direction={sortKey === 'lastActiveAt' ? sortDirection : 'desc'}
                  onClick={() => toggleSort('lastActiveAt')}
                >
                  {t('allUsers.lastActive')}
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(user => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Row alignItems="center" spacing={1.5}>
                    <Avatar
                      src={user.picture || undefined}
                      sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'primary.main' }}
                    >
                      {getInitials(user.name)}
                    </Avatar>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{user.name}</Typography>
                  </Row>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {user.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: 12 }}>{formatDate(user.createdAt)}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                    {user.totalTransactions}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {formatRelative(user.lastActiveAt)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Box sx={{ py: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('allUsers.empty')}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Column>
  );
};

export default UsersTable;
