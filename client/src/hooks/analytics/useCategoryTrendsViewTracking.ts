import { useEffect } from 'react';

import api from '@/api/axios';
import { API_ROUTES } from '@/constants/Routes';
import { useAuth } from '@/providers/AuthProvider';

export const useCategoryTrendsViewTracking = () => {
  const { user } = useAuth();
  const hasConsent = user?.analyticsConsent === 'accepted';

  useEffect(() => {
    if (!hasConsent) {
      return;
    }

    void api.post(API_ROUTES.ANALYTICS_CATEGORY_TRENDS_VIEW).catch(() => {});
  }, [hasConsent]);
};
