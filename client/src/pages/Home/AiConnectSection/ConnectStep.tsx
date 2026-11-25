import { Typography, useTheme } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { getUrlChipStyle } from '@/pages/Home/AiConnectSection/styles';

const ACCENT_PURPLE = '#a78bfa';

interface ConnectStepProps {
  number: string;
  title: string;
  description: string;
  code?: string;
}

const ConnectStep = ({ number, title, description, code }: ConnectStepProps) => {
  const theme = useTheme();

  return (
    <Row spacing={2} alignItems="flex-start">
      <Typography
        sx={{
          flex: 'none',
          width: 32,
          pt: 0.25,
          fontSize: '0.8rem',
          fontWeight: 700,
          color: ACCENT_PURPLE,
          letterSpacing: '0.18em',
        }}
      >
        {number}
      </Typography>
      <Column spacing={0.75} sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.05rem' }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.75 }}>
          {description}
        </Typography>
        {code && (
          <Typography component="code" dir="ltr" sx={getUrlChipStyle(theme)}>
            {code}
          </Typography>
        )}
      </Column>
    </Row>
  );
};

export default ConnectStep;
