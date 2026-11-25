import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import ConnectStep from '@/pages/Home/AiConnectSection/ConnectStep';

const MCP_SERVER_URL = 'https://api.lyra-il.com/mcp';

const ConnectSteps = () => {
  const { t } = useTranslation('home');

  const steps = [
    {
      number: '01',
      title: t('landing.ai.steps.add.title'),
      description: t('landing.ai.steps.add.description'),
      code: MCP_SERVER_URL,
    },
    {
      number: '02',
      title: t('landing.ai.steps.allow.title'),
      description: t('landing.ai.steps.allow.description'),
    },
    {
      number: '03',
      title: t('landing.ai.steps.ask.title'),
      description: t('landing.ai.steps.ask.description'),
    },
  ];

  return (
    <Column spacing={2.5}>
      <Typography
        component="h3"
        sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.25rem' }}
      >
        {t('landing.ai.steps.title')}
      </Typography>
      {steps.map(step => (
        <ConnectStep key={step.number} {...step} />
      ))}
    </Column>
  );
};

export default ConnectSteps;
