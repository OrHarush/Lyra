import { Stack } from '@mui/material';
import { StackProps } from '@mui/material/Stack/Stack';
import { forwardRef, ReactNode } from 'react';

interface ColumnProps extends StackProps {
  children: ReactNode;
}

const Column = forwardRef<HTMLDivElement, ColumnProps>(({ children, ...props }, ref) => (
  <Stack ref={ref} direction="column" {...props}>
    {children}
  </Stack>
));

Column.displayName = 'Column';

export default Column;
