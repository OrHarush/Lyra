import { Paper, Skeleton } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';

const TransactionCardSkeleton = () => (
  <Column spacing={1}>
    <Column>
      {Array.from({ length: 6 }).map((_, index) => (
        <Paper
          key={index}
          sx={{
            height: '76px',
            p: '14px 20px',
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative',
            boxShadow: 'none',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:first-of-type': {
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
            },
            '&:last-of-type': {
              borderBottomLeftRadius: '12px',
              borderBottomRightRadius: '12px',
              borderBottom: 'none',
            },
          }}
        >
          <Column
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              backgroundColor: 'action.selected',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Skeleton variant="circular" width={20} height={20} />
          </Column>
          <Column sx={{ flex: 1, minWidth: 0 }}>
            <Row justifyContent="space-between" alignItems="center" mb={0.5}>
              <Skeleton variant="text" width={70} height={20} />
              <Skeleton variant="text" width={50} height={20} />
            </Row>
            <Row justifyContent="space-between">
              <Skeleton variant="text" width="30%" height={16} />
              <Skeleton variant="text" width="20%" height={16} />
            </Row>
          </Column>
          <Row spacing={1}>
            <Skeleton variant="circular" width={28} height={28} />
            <Skeleton variant="circular" width={28} height={28} />
          </Row>
        </Paper>
      ))}
    </Column>
  </Column>
);

export default TransactionCardSkeleton;
