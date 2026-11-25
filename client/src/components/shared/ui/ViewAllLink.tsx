import { Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface ViewAllLinkProps {
  to: string;
  label: string;
}

const ViewAllLink = ({ to, label }: ViewAllLinkProps) => (
  <Link
    component={RouterLink}
    to={to}
    underline="hover"
    sx={{
      flexShrink: 0,
      whiteSpace: 'nowrap',
      fontSize: '0.8125rem',
      fontWeight: 600,
      color: 'primary.main',
    }}
  >
    {label}
  </Link>
);

export default ViewAllLink;
