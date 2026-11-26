import Row from '@/components/shared/layout/containers/Row';
import ThemeToggleButton from '@/components/shared/layout/NavBar/ThemeToggleButton';
import LanguageSelect from '@/components/shared/ui/LanguageSelect';

const AppearanceSettings = () => (
    <Row spacing={1}>
      <ThemeToggleButton />
      <LanguageSelect sx={{ width: 40, height: 40, backgroundColor: 'transparent' }} />
    </Row>
  );

export default AppearanceSettings;