import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

import FeatureCard from '@/pages/Home/BottomCtaSection/FeatureCard';

const PrivacyCards = () => {
  const { t } = useTranslation('home');

  const cards = [
    {
      key: 'readOnly',
      icon: <VisibilityOutlinedIcon />,
      title: t('landing.ai.privacy.readOnly.title'),
      description: t('landing.ai.privacy.readOnly.description'),
    },
    {
      key: 'workspace',
      icon: <HomeOutlinedIcon />,
      title: t('landing.ai.privacy.workspace.title'),
      description: t('landing.ai.privacy.workspace.description'),
    },
    {
      key: 'revoke',
      icon: <LinkOffIcon />,
      title: t('landing.ai.privacy.revoke.title'),
      description: t('landing.ai.privacy.revoke.description'),
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        gap: { xs: 1.5, md: 2.5 },
        width: '100%',
      }}
    >
      {cards.map(card => (
        <FeatureCard
          key={card.key}
          icon={card.icon}
          title={card.title}
          description={card.description}
        />
      ))}
    </Box>
  );
};

export default PrivacyCards;
