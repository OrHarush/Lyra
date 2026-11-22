import { ReactNode } from 'react';

import Column from '@/components/shared/layout/containers/Column';

interface PageLayoutProps {
  children: ReactNode;
}

const PAGE_MAX_WIDTH = 1600;

const PageLayout = ({ children }: PageLayoutProps) => (
  <Column
    height="100%"
    width="100%"
    maxWidth={PAGE_MAX_WIDTH}
    spacing={2}
    alignSelf="center"
    sx={{ px: { xs: 1.5, sm: 2, md: 3, lg: 4 }, py: 2 }}
  >
    {children}
  </Column>
);

export default PageLayout;
