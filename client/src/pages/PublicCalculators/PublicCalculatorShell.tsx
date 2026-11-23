import { Divider } from '@mui/material';
import { ReactNode } from 'react';

import Column from '@/components/shared/layout/containers/Column';
import ScrollableColumn from '@/components/shared/layout/containers/ScrollableColumn';
import Footer from '@/components/shared/layout/Footer';
import LandingNavbar from '@/pages/Home/LandingNavbar';

interface PublicCalculatorShellProps {
  children: ReactNode;
}

const PublicCalculatorShell = ({ children }: PublicCalculatorShellProps) => (
  <>
    <LandingNavbar />
    <ScrollableColumn
      component="main"
      alignItems="center"
      sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 4, md: 6 }, flex: 1 }}
    >
      <Column component="article" spacing={4} sx={{ width: '100%', maxWidth: 1100 }}>
        {children}
      </Column>
      <Divider sx={{ mt: 'auto', width: '100%', maxWidth: 900 }} />
      <Footer />
    </ScrollableColumn>
  </>
);

export default PublicCalculatorShell;
