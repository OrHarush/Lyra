import { MenuItem, Select } from '@mui/material';

import { TrendPill } from '@/pages/CategoryTrends/useCategoryTrendsPage';

interface CategoryDropdownProps {
  pills: TrendPill[];
  selectedId: string | undefined;
  onSelect: (categoryId: string) => void;
  ariaLabel: string;
}

const CategoryDropdown = ({ pills, selectedId, onSelect, ariaLabel }: CategoryDropdownProps) => (
  <Select
    size="small"
    value={selectedId ?? ''}
    onChange={event => onSelect(event.target.value)}
    inputProps={{ 'aria-label': ariaLabel }}
    MenuProps={{ slotProps: { paper: { sx: { maxHeight: 360 } } } }}
    sx={{ maxWidth: 320 }}
  >
    {pills.map(pill => (
      <MenuItem key={pill.id} value={pill.id}>
        {pill.name}
      </MenuItem>
    ))}
  </Select>
);

export default CategoryDropdown;
