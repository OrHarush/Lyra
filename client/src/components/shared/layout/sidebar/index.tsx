import Column from '@/components/shared/layout/containers/Column';
import ScrollableColumn from '@/components/shared/layout/containers/ScrollableColumn';
import DesktopSidebar from '@/components/shared/layout/sidebar/DesktopSidebar';
import MobileSidebar from '@/components/shared/layout/sidebar/MobileSidebar';
import Settings from '@/components/shared/layout/sidebar/settings';
import SidebarButtons from '@/components/shared/layout/sidebar/SidebarButtons';
import SidebarHeader from '@/components/shared/layout/sidebar/SidebarHeader';
import SidebarShareCard from '@/components/shared/layout/sidebar/SidebarShareCard';
import WorkspaceSwitcher from '@/components/shared/layout/sidebar/WorkspaceSwitcher';
import { useIsSmallScreen } from '@/hooks/common/useIsSmallScreen';

interface SidebarProps {
  mobileOpen: boolean;
  onMobileOpen: () => void;
  onMobileClose: () => void;
  sidebarExpanded: boolean;
  onToggleSidebar: () => void;
}

const Sidebar = ({
  mobileOpen,
  onMobileOpen,
  onMobileClose,
  sidebarExpanded,
  onToggleSidebar,
}: SidebarProps) => {
  const isSmallScreen = useIsSmallScreen();

  const content = (
    <Column height={'100%'}>
      <SidebarHeader onMobileClose={onMobileClose} />
      <WorkspaceSwitcher />
      <ScrollableColumn spacing={2} flex={1} minHeight={0}>
        <SidebarButtons />
      </ScrollableColumn>
      <SidebarShareCard />
      <Settings />
    </Column>
  );

  if (isSmallScreen) {
    return (
      <MobileSidebar open={mobileOpen} onOpen={onMobileOpen} onClose={onMobileClose}>
        {content}
      </MobileSidebar>
    );
  }

  return (
    <DesktopSidebar expanded={sidebarExpanded} toggleExpanded={onToggleSidebar}>
      {content}
    </DesktopSidebar>
  );
};

export default Sidebar;
