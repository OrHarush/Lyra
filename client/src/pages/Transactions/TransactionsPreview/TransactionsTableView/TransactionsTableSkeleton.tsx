import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import TransactionTableHeaders from '@/pages/Transactions/TransactionsPreview/TransactionsTableView/TransactionTableHeaders';

const TransactionsTableSkeleton = () => (
    <Column height={'100%'} minHeight={0}>
      <Column flex={1} minHeight={0} sx={{ overflow: 'hidden' }}>
        <TableContainer sx={{ flex: 1, minHeight: 0 }}>
          <Table
            stickyHeader
            aria-label="transactions table"
            sx={{
              borderCollapse: 'separate',
              borderSpacing: 0,
              '& th': {
                backgroundColor: 'background.paper',
                fontWeight: 600,
                color: 'text.primary',
                borderBottom: '1px solid',
                borderColor: 'divider',
              },
              '& td': {
                borderBottom: '1px solid',
                borderColor: 'divider',
              },
            }}
          >
            <TransactionTableHeaders order="desc" orderBy="date" onSort={() => {}} />
            <TableBody>
              {Array.from({ length: 8 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton variant="text" width="50%" height={24} />
                  </TableCell>
                  <TableCell align="left">
                    <Skeleton variant="text" width="60px" height={24} />
                  </TableCell>
                  <TableCell align="left">
                    <Skeleton
                      variant="rounded"
                      width={150}
                      height={36}
                      sx={{ borderRadius: '8px' }}
                    />
                  </TableCell>
                  <TableCell align="left">
                    <Skeleton variant="text" width="70px" height={24} />
                  </TableCell>
                  <TableCell align="left">
                    <Skeleton variant="text" width="60px" height={24} />
                  </TableCell>
                  <TableCell align="left">
                    <Skeleton variant="text" width="80px" height={24} />
                  </TableCell>
                  <TableCell align="left">
                    <Row spacing={1} justifyContent="center">
                      <Skeleton variant="circular" width={30} height={30} />
                      <Skeleton variant="circular" width={30} height={30} />
                      <Skeleton variant="circular" width={30} height={30} />
                    </Row>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Skeleton
          variant="rectangular"
          height={52}
          sx={{ borderTop: '1px solid', borderColor: 'divider' }}
        />
      </Column>
    </Column>
  );

export default TransactionsTableSkeleton;
