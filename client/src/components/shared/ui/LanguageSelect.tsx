import { IconButton, Menu, MenuItem, Typography,useTheme } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import React, { useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { useTranslation } from 'react-i18next';

import Row from '@/components/shared/layout/containers/Row';
import { LANGUAGES } from '@/constants/languages';

interface LanguageSelectProps {
  sx?: SxProps<Theme>;
  menuDirection?: 'up' | 'down';
}

const LanguageSelect = ({ sx, menuDirection = 'down' }: LanguageSelectProps) => {
  const theme = useTheme();
  const { i18n } = useTranslation('common');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const isRtl = i18n.language === 'he';

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    handleClose();
  };

  const currentLang = i18n.language;
  const currentFlag = LANGUAGES.find(({ code }) => code === currentLang)?.flag ?? 'GB';

  return (
    <>
      <IconButton onClick={handleClick} sx={{ borderRadius: '8px', ...sx }}>
        <ReactCountryFlag
          countryCode={currentFlag}
          svg
          style={{
            fontSize: '1em',
            borderRadius: '4px',
          }}
        />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: menuDirection === 'down' ? 'bottom' : 'top',
          horizontal: isRtl ? 'right' : 'left',
        }}
        transformOrigin={{
          vertical: menuDirection === 'down' ? 'top' : 'bottom',
          horizontal: isRtl ? 'right' : 'left',
        }}
        sx={{
          '& .MuiPaper-root': {
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2,
            minWidth: 160,
          },
        }}
      >
        {LANGUAGES.map(lang => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            selected={lang.code === currentLang}
            sx={{
              py: 1.5,
              px: 2,
            }}
          >
            <Row spacing={1.5} alignItems="center">
              <ReactCountryFlag
                countryCode={lang.flag}
                svg
                style={{
                  fontSize: '1.5em',
                  borderRadius: '4px',
                }}
              />
              <Typography variant="body2" fontWeight={500}>
                {lang.label}
              </Typography>
            </Row>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSelect;
