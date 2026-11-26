import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import ConsentBanner from '@/components/features/consent/ConsentBanner';
import FeedbackDialog from '@/components/features/feedback/FeedbackDialog';
import MonthlyReportDialog from '@/components/features/monthlyReport/MonthlyReportDialog';
import BottomNav from '@/components/shared/layout/BottomNav';
import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import NavBar from '@/components/shared/layout/NavBar';
import { PageHeaderProvider } from '@/components/shared/layout/PageHeaderContext';
import Sidebar from '@/components/shared/layout/sidebar';
import { usePwaInstallTracking } from '@/hooks/analytics/usePwaInstallTracking';
import { useFeedbackPopup } from '@/hooks/feedback/useFeedbackPopup';
import { useMonthlyReportPopup } from '@/hooks/monthlyReport/useMonthlyReportPopup';
import { BillApprovalProvider } from '@/providers/BillApprovalProvider';

const AuthenticatedLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const { isOpen: isSurveyOpen, closeSurvey } = useFeedbackPopup();
  const { isOpen: isReportOpen, closeReport, eligibleData } = useMonthlyReportPopup();
  usePwaInstallTracking();

  const openMobile = () => setMobileOpen(true);
  const closeMobile = () => setMobileOpen(false);
  const toggleSidebar = () => setSidebarExpanded(prev => !prev);

  return (
    <PageHeaderProvider>
      <BillApprovalProvider>
        <Row height={'100dvh'} width={'100%'} overflow={'hidden'}>
          <Sidebar
            mobileOpen={mobileOpen}
            onMobileOpen={openMobile}
            onMobileClose={closeMobile}
            sidebarExpanded={sidebarExpanded}
            onToggleSidebar={toggleSidebar}
          />
          <Column width={'100%'} minWidth={0} minHeight={0} overflow={'hidden'}>
            <NavBar
              onMobileOpen={openMobile}
              sidebarExpanded={sidebarExpanded}
              onToggleSidebar={toggleSidebar}
            />
            <Column flex={1} minHeight={0} overflow={'auto'}>
              <Outlet />
            </Column>
            <BottomNav />
          </Column>
        </Row>
      </BillApprovalProvider>
      <ConsentBanner />
      {isSurveyOpen && (
        <FeedbackDialog isOpen={isSurveyOpen} closeDialog={closeSurvey} variant="popup" />
      )}
      {isReportOpen && eligibleData && (
        <MonthlyReportDialog
          isOpen={isReportOpen}
          closeDialog={closeReport}
          month={eligibleData.month}
          summary={eligibleData.summary}
        />
      )}
    </PageHeaderProvider>
  );
};

export default AuthenticatedLayout;
