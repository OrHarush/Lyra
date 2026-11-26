import { SxProps, Theme } from '@mui/material/styles';
import { SystemStyleObject } from '@mui/system';

export const getToggleButtonGroupStyles = (
  selectedColor: string,
  selectedTypeIndex: number,
  optionCount: number
): SystemStyleObject<Theme> => ({
  position: 'relative',
  display: 'inline-flex',
  alignSelf: 'center',
  width: 'fit-content',
  p: 0.5,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 2,
  bgcolor: 'background.paper',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 4,
    left: 4,
    width: `calc((100% - 8px) / ${optionCount})`,
    height: 'calc(100% - 8px)',
    borderRadius: 1.5,
    bgcolor: `${selectedColor}1F`,
    border: '1px solid',
    borderColor: selectedColor,
    transform: `translateX(${Math.max(selectedTypeIndex, 0) * 100}%)`,
    transition: 'transform 220ms ease, background-color 220ms ease, border-color 220ms ease',
    zIndex: 0,
  },
});

export const getToggleButtonStyles = (isSelected: boolean, color: string): SystemStyleObject<Theme> => ({
  position: 'relative',
  zIndex: 1,
  minWidth: { xs: 80, sm: 118 },
  px: { xs: 1, sm: 2 },
  py: { xs: 0.5, sm: 0.75 },
  border: 0,
  textTransform: 'none',
  fontSize: { xs: '0.78rem', sm: '0.9rem' },
  fontWeight: 500,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 0.75,
  color: isSelected ? color : 'text.secondary',
  transition: 'color 220ms ease',
  '&:hover': {
    bgcolor: 'transparent',
  },
  '&.Mui-selected, &.Mui-selected:hover': {
    bgcolor: 'transparent',
    color,
    fontWeight: 600,
  },
  '&:not(:first-of-type)': {
    ml: 0,
  },
});

export const getIconStyles = (): SxProps<Theme> => ({
  fontSize: 18,
});
