import { Divider, List, ListItemButton, ListSubheader, Typography } from '@mui/material';
import { ReactNode } from 'react';

import Column from '@/components/shared/layout/containers/Column';

import { getOptionStyle } from './styles';

export interface MultiSelectChipItem {
  id: string;
  renderRow?: () => ReactNode;
  subheaderLabel?: string;
  isDivider?: boolean;
}

interface MultiSelectChipListProps {
  items: MultiSelectChipItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

const MultiSelectChipList = ({ items, selectedIds, onToggle }: MultiSelectChipListProps) => {
  if (items.length === 0) {
    return (
      <Column px={2} py={1.5}>
        <Typography variant="body2" color="text.secondary">
          —
        </Typography>
      </Column>
    );
  }

  return (
    <List dense disablePadding sx={{ overflowY: 'auto', flex: 1 }}>
      {items.map(item => {
        if (item.isDivider) {
          return <Divider key={item.id} component="li" />;
        }

        if (item.subheaderLabel) {
          return (
            <ListSubheader
              key={item.id}
              disableSticky
              sx={{ fontSize: '0.7rem', color: 'text.secondary', lineHeight: '1.8rem' }}
            >
              {item.subheaderLabel}
            </ListSubheader>
          );
        }

        return (
          <ListItemButton
            key={item.id}
            selected={selectedIds.includes(item.id)}
            aria-pressed={selectedIds.includes(item.id)}
            onClick={() => onToggle(item.id)}
            sx={getOptionStyle}
          >
            {item.renderRow?.()}
          </ListItemButton>
        );
      })}
    </List>
  );
};

export default MultiSelectChipList;
