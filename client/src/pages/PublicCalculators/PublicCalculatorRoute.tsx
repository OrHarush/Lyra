import { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '@/providers/AuthProvider';

interface PublicCalculatorRouteProps {
  toolsRoute: string;
  children: ReactElement;
}

const PublicCalculatorRoute = ({ toolsRoute, children }: PublicCalculatorRouteProps) => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={toolsRoute} replace />;
  }

  return children;
};

export default PublicCalculatorRoute;
