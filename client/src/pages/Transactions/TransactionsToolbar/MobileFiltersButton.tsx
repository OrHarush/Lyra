import FilterListIcon from '@mui/icons-material/FilterList';
import { Badge, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface MobileFiltersButtonProps {
  activeCount: number;
  onClick: () => void;
}

const MobileFiltersButton = ({ activeCount, onClick }: MobileFiltersButtonProps) => {
  const { t } = useTranslation('transactions');

  return (
    <Badge badgeContent={activeCount} color="primary" sx={{ flexShrink: 0 }}>
      <Button
        variant="outlined"
        color="inherit"
        startIcon={<FilterListIcon />}
        onClick={onClick}
        sx={{ height: 40, whiteSpace: 'nowrap' }}
      >
        {t('filters.button')}
      </Button>
    </Badge>
  );
};

export default MobileFiltersButton;
