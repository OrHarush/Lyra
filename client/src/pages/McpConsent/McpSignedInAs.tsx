import { Avatar, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { UserDto } from '@/types/User';

const McpSignedInAs = ({ user }: { user: UserDto }) => {
  const { t } = useTranslation('mcp');

  return (
    <Row spacing={1.5} alignItems="center">
      <Avatar src={user.picture} alt={user.name} sx={{ width: 36, height: 36 }} />
      <Column sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {t('consent.signedInAs')}
        </Typography>
        <Typography variant="body2" fontWeight={600} noWrap>
          {user.name || user.email}
        </Typography>
        {user.name && (
          <Typography variant="caption" color="text.secondary" noWrap>
            {user.email}
          </Typography>
        )}
      </Column>
    </Row>
  );
};

export default McpSignedInAs;
