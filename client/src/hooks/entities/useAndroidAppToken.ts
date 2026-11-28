import { API_ROUTES } from '@/constants/Routes';
import { useApiMutation } from '@/hooks/useApiMutation';

interface AndroidAppTokenResponse {
  success: boolean;
  data: { token: string };
}

export const useCreateAndroidAppToken = () =>
  useApiMutation<AndroidAppTokenResponse, void>({
    method: 'post',
    url: API_ROUTES.SHORTCUT.ANDROID_TOKEN,
  });
