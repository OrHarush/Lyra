import NotificationBell from '@/components/features/notifications/NotificationBell';
import Row from '@/components/shared/layout/containers/Row';
import ThemeToggleButton from '@/components/shared/layout/NavBar/ThemeToggleButton';
import { usePageHeaderContext } from '@/components/shared/layout/PageHeaderContext';
import MonthDateSelector from '@/components/shared/ui/MonthDateSelector';

const Controls = () => {
  const { showDateSelector, dateConfig } = usePageHeaderContext();

  return (
    <Row spacing={2} sx={{ marginInlineStart: 'auto' }}>
      {showDateSelector && dateConfig && (
        <MonthDateSelector value={dateConfig.value} onChange={dateConfig.onChange} />
      )}
      <Row spacing={1}>
        <NotificationBell />
        <ThemeToggleButton />
      </Row>
    </Row>
  );
};

export default Controls;
