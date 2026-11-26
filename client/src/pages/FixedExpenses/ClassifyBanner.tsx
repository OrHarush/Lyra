import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { getBannerStyle } from '@/pages/FixedExpenses/styles';

const ClassifyBanner = () => {
  const { t } = useTranslation('fixedExpenses');

  return (
    <Row role="note" sx={getBannerStyle()}>
      <InfoOutlinedIcon color="primary" sx={{ mt: 0.25 }} />
      <Column spacing={0.25} sx={{ minWidth: 0 }}>
        <Typography fontWeight={700}>{t('banner.title')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t('banner.body')}
        </Typography>
      </Column>
    </Row>
  );
};

export default ClassifyBanner;
