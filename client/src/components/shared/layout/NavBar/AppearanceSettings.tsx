import Row from '@/components/shared/layout/containers/Row';
import ThemeToggleButton from '@/components/shared/layout/NavBar/ThemeToggleButton';
import LanguageSelect from '@/components/shared/ui/LanguageSelect';

interface AppearanceSettingsProps {
  menuDirection?: 'up' | 'down';
}

const AppearanceSettings = ({ menuDirection }: AppearanceSettingsProps) => (
  <Row spacing={1} alignItems="center">
    <ThemeToggleButton />
    <LanguageSelect
      menuDirection={menuDirection}
      sx={{ width: 40, height: 40, backgroundColor: 'transparent' }}
    />
  </Row>
);

export default AppearanceSettings;