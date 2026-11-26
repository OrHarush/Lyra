import { BillType, SUBSCRIPTION_PROVIDERS, SubscriptionProviderId } from '@lyra/shared';
import BoltIcon from '@mui/icons-material/Bolt';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import WaterDropIcon from '@mui/icons-material/WaterDrop';

export const BILL_TYPE_ICONS: Record<BillType, typeof BoltIcon> = {
  electricity: BoltIcon,
  water: WaterDropIcon,
  arnona: HomeWorkIcon,
  gas: LocalFireDepartmentIcon,
  other: ReceiptLongIcon,
};

export const getProviderName = (providerId: SubscriptionProviderId, language: string) => {
  const { name } = SUBSCRIPTION_PROVIDERS[providerId];

  return language.startsWith('he') ? name.he : name.en;
};

export const getProviderCancelUrl = (providerId?: SubscriptionProviderId | null) =>
  providerId ? SUBSCRIPTION_PROVIDERS[providerId].cancelUrl : undefined;

export const openCancellationPage = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};
