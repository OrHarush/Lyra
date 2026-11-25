import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Chip, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';

const READ_SCOPES = ['transactions', 'accounts', 'categories', 'budgets'] as const;

const McpScopeList = () => {
  const { t } = useTranslation('mcp');

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Column spacing={1.5}>
        <Row
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          useFlexGap
        >
          <Typography variant="body2" fontWeight={600}>
            {t('consent.accessIntro')}
          </Typography>
          <Chip
            size="small"
            color="success"
            variant="outlined"
            icon={<VisibilityOutlinedIcon />}
            label={t('consent.readOnlyBadge')}
          />
        </Row>
        <Column component="ul" spacing={0.75} sx={{ m: 0, paddingInlineStart: 2.5 }}>
          {READ_SCOPES.map(scope => (
            <Typography key={scope} component="li" variant="body2">
              {t(`consent.scopes.${scope}`)}
            </Typography>
          ))}
        </Column>
        <Row spacing={1} alignItems="flex-start">
          <LockOutlinedIcon
            sx={{ fontSize: 18, color: 'text.secondary', mt: 0.25, flexShrink: 0 }}
          />
          <Typography variant="body2" color="text.secondary">
            {t('consent.cannotChange')}
          </Typography>
        </Row>
      </Column>
    </Paper>
  );
};

export default McpScopeList;
