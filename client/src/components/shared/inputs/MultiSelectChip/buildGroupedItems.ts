import { MultiSelectChipItem } from './MultiSelectChipList';

export interface MultiSelectChipGroup {
  label: string;
  items: MultiSelectChipItem[];
}

export const buildGroupedItems = (groups: MultiSelectChipGroup[]): MultiSelectChipItem[] =>
  groups
    .filter(group => group.items.length > 0)
    .flatMap((group, index) => [
      ...(index > 0 ? [{ id: `divider-${index}`, isDivider: true }] : []),
      { id: `header-${index}`, subheaderLabel: group.label },
      ...group.items,
    ]);
