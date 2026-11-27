import { MenuItem, Select, Typography } from '@mui/material';
import ReactCountryFlag from 'react-country-flag';
import { useTranslation } from 'react-i18next';

import SettingsRow from '@/components/features/users/SettingsModal/SettingsRow';
import Row from '@/components/shared/layout/containers/Row';
import { LANGUAGES } from '@/constants/languages';

const LanguageSetting = () => {
  const { t, i18n } = useTranslation('user');
  const selectedCode = LANGUAGES.find(({ code }) => code === i18n.language)?.code ?? 'he';

  const changeLanguage = (code: string) => {
    void i18n.changeLanguage(code);
  };

  return (
    <SettingsRow label={t('settingsModal.language')}>
      <Select
        size="small"
        value={selectedCode}
        onChange={e => changeLanguage(e.target.value)}
        inputProps={{ 'aria-label': t('settingsModal.language') }}
        sx={{ width: 160, flexShrink: 0 }}
      >
        {LANGUAGES.map(language => (
          <MenuItem key={language.code} value={language.code}>
            <Row spacing={1.5} alignItems="center">
              <ReactCountryFlag countryCode={language.flag} svg style={{ fontSize: '1.25em' }} />
              <Typography variant="body2">{language.label}</Typography>
            </Row>
          </MenuItem>
        ))}
      </Select>
    </SettingsRow>
  );
};

export default LanguageSetting;
