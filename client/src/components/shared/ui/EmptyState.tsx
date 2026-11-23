import { SvgIconComponent } from '@mui/icons-material';
import { Button, Card, CardContent, Typography } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'contained' | 'outlined';
}

interface EmptyStateProps {
  icon: SvgIconComponent;
  title: string;
  description: string;
  action?: EmptyStateAction;
  isMuted?: boolean;
}

const EmptyState = ({ icon: Icon, title, description, action, isMuted = false }: EmptyStateProps) => (
  <Card sx={{ borderRadius: 2, border: '1px dashed', borderColor: 'divider', boxShadow: 'none' }}>
    <CardContent sx={{ py: { xs: 5, sm: 7 }, px: 3 }}>
      <Column spacing={2} alignItems="center" sx={{ textAlign: 'center' }}>
        <Row
          alignItems="center"
          justifyContent="center"
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: 'action.hover',
          }}
        >
          <Icon sx={{ fontSize: 32, color: isMuted ? 'text.secondary' : 'primary.main' }} />
        </Row>
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480 }}>
          {description}
        </Typography>
        {action && (
          <Button variant={action.variant ?? 'contained'} onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </Column>
    </CardContent>
  </Card>
);

export default EmptyState;
