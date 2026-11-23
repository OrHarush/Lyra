import {
  alpha,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { Fragment } from 'react';

import Column from '@/components/shared/layout/containers/Column';
import { ArticleTableContent } from '@/pages/Blog/shared/types';

const NUMBER_TOKEN = /(₪[\d,.]+\+?|\d+(?:\.\d+)?%)/g;
const MIN_TABLE_WIDTH = 560;

const keepNumbersTogether = (text: string) =>
  text.split(NUMBER_TOKEN).map((part, index) =>
    index % 2 === 1 ? (
      <Box key={index} component="span" sx={{ whiteSpace: 'nowrap' }}>
        {part}
      </Box>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    )
  );

interface ArticleTableProps {
  table: ArticleTableContent;
}

const ArticleTable = ({ table }: ArticleTableProps) => {
  const theme = useTheme();
  const hairline = `1px solid ${theme.palette.divider}`;
  const highlighted = new Set(table.highlightRows ?? []);

  const headerCellSx = {
    fontWeight: 700,
    fontSize: { xs: '0.78rem', md: '0.85rem' },
    borderBottom: hairline,
    py: { xs: 1.25, md: 1.5 },
    px: { xs: 1.25, md: 2 },
    color: theme.palette.text.secondary,
    textAlign: 'start',
  } as const;

  const bodyCellSx = {
    borderBottom: hairline,
    py: { xs: 1.25, md: 1.5 },
    px: { xs: 1.25, md: 2 },
    fontSize: { xs: '0.85rem', md: '0.92rem' },
    lineHeight: 1.6,
    color: theme.palette.text.secondary,
    textAlign: 'start',
    verticalAlign: 'top',
  } as const;

  return (
    <Column spacing={1} sx={{ width: '100%' }}>
      <Box
        sx={{
          width: '100%',
          overflowX: 'auto',
          borderRadius: 3,
          border: hairline,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Table sx={{ minWidth: MIN_TABLE_WIDTH, '& tr:last-of-type td': { borderBottom: 'none' } }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
              {table.columns.map((column, index) => (
                <TableCell key={index} sx={headerCellSx}>
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {table.rows.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                sx={
                  highlighted.has(rowIndex)
                    ? { backgroundColor: alpha(theme.palette.primary.main, 0.12) }
                    : undefined
                }
              >
                {row.map((cell, cellIndex) => (
                  <TableCell
                    key={cellIndex}
                    sx={{
                      ...bodyCellSx,
                      ...(cellIndex === 0 || highlighted.has(rowIndex)
                        ? { color: theme.palette.text.primary, fontWeight: 600 }
                        : null),
                    }}
                  >
                    {keepNumbersTogether(cell)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      {table.note && (
        <Typography sx={{ fontSize: '0.8rem', color: 'text.disabled', lineHeight: 1.6 }}>
          {table.note}
        </Typography>
      )}
    </Column>
  );
};

export default ArticleTable;
