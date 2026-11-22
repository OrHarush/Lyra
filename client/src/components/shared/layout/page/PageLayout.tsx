import { ReactNode } from 'react';

import Column from '@/components/shared/layout/containers/Column';

interface PageLayoutProps {
  children: ReactNode;
  hasNaturalHeight?: boolean;
  spacing?: number;
}

const PAGE_MAX_WIDTH = 1600;

// Pages that fill the viewport (dashboard, tables) need a fixed 100% height; long scrolling pages
// must grow with their content, otherwise flex children shrink and cards collapse.
const PageLayout = ({ children, hasNaturalHeight = false, spacing = 2 }: PageLayoutProps) => (
  <Column
    height={hasNaturalHeight ? undefined : '100%'}
    width="100%"
    maxWidth={PAGE_MAX_WIDTH}
    spacing={spacing}
    alignSelf="center"
    sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 }, py: 2, flexShrink: 0 }}
  >
    {children}
  </Column>
);

export default PageLayout;
