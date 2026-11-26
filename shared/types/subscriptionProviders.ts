// Subscriptions users can pick when creating a recurring expense. Picking one fills in the name
// and the cancellation link. A link is listed only after it was checked live on the provider's
// own site; leave it out rather than guess. Order within a category is by popularity.

export const SUBSCRIPTION_PROVIDER_CATEGORIES = [
  'streaming',
  'music',
  'tv',
  'mobile',
  'internet',
  'cloud',
  'ai',
  'news',
  'dating',
  'gym',
] as const;

export type SubscriptionProviderCategory = (typeof SUBSCRIPTION_PROVIDER_CATEGORIES)[number];

export type CancelChannel = 'online' | 'phone' | 'in_person';

export interface SubscriptionProvider {
  id: string;
  name: { en: string; he: string };
  category: SubscriptionProviderCategory;
  cancelUrl?: string;
  cancelChannel?: CancelChannel;
}

export const SUBSCRIPTION_PROVIDER_IDS = [
  'netflix',
  'youtube_premium',
  'disney_plus',
  'spotify',
  'apple_music',
  'yes',
  'hot',
  'partner_tv',
  'cellcom_tv',
  'sting',
  'cellcom',
  'partner',
  'hot_mobile',
  'golan_telecom',
  'bezeq',
  'bezeq_international',
  'netvision',
  'smile_012',
  'google_one',
  'microsoft_365',
  'chatgpt_plus',
  'haaretz',
  'calcalist',
  'tinder',
  'hinge',
  'holmes_place',
  'go_active',
] as const;

export type SubscriptionProviderId = (typeof SUBSCRIPTION_PROVIDER_IDS)[number];

export const SUBSCRIPTION_PROVIDERS: Record<SubscriptionProviderId, SubscriptionProvider> = {
  netflix: { id: 'netflix', name: { en: 'Netflix', he: 'נטפליקס' }, category: 'streaming', cancelChannel: 'online' },
  youtube_premium: { id: 'youtube_premium', name: { en: 'YouTube Premium', he: 'YouTube Premium' }, category: 'streaming' },
  disney_plus: { id: 'disney_plus', name: { en: 'Disney+', he: 'דיסני+' }, category: 'streaming' },
  spotify: { id: 'spotify', name: { en: 'Spotify', he: 'ספוטיפיי' }, category: 'music' },
  apple_music: { id: 'apple_music', name: { en: 'Apple Music', he: 'Apple Music' }, category: 'music' },
  yes: { id: 'yes', name: { en: 'Yes', he: 'yes' }, category: 'tv' },
  hot: { id: 'hot', name: { en: 'HOT', he: 'הוט' }, category: 'tv' },
  partner_tv: { id: 'partner_tv', name: { en: 'Partner TV', he: 'פרטנר TV' }, category: 'tv' },
  cellcom_tv: { id: 'cellcom_tv', name: { en: 'Cellcom TV', he: 'סלקום TV' }, category: 'tv' },
  sting: { id: 'sting', name: { en: 'Sting', he: 'סטינג' }, category: 'tv' },
  cellcom: { id: 'cellcom', name: { en: 'Cellcom', he: 'סלקום' }, category: 'mobile' },
  partner: { id: 'partner', name: { en: 'Partner', he: 'פרטנר' }, category: 'mobile' },
  hot_mobile: { id: 'hot_mobile', name: { en: 'HOT Mobile', he: 'הוט מובייל' }, category: 'mobile' },
  golan_telecom: { id: 'golan_telecom', name: { en: 'Golan Telecom', he: 'גולן טלקום' }, category: 'mobile' },
  bezeq: { id: 'bezeq', name: { en: 'Bezeq', he: 'בזק' }, category: 'internet' },
  bezeq_international: { id: 'bezeq_international', name: { en: 'Bezeq International', he: 'בזק בינלאומי' }, category: 'internet' },
  netvision: { id: 'netvision', name: { en: 'Netvision', he: "נטוויז'ן" }, category: 'internet' },
  smile_012: { id: 'smile_012', name: { en: '012 Smile', he: '012 סמייל' }, category: 'internet' },
  google_one: {
    id: 'google_one',
    name: { en: 'Google One', he: 'Google One' },
    category: 'cloud',
    cancelUrl: 'https://support.google.com/googleone/answer/2736362',
    cancelChannel: 'online',
  },
  microsoft_365: { id: 'microsoft_365', name: { en: 'Microsoft 365', he: 'Microsoft 365' }, category: 'cloud' },
  chatgpt_plus: { id: 'chatgpt_plus', name: { en: 'ChatGPT Plus', he: 'ChatGPT Plus' }, category: 'ai' },
  haaretz: { id: 'haaretz', name: { en: 'Haaretz', he: 'הארץ' }, category: 'news' },
  calcalist: { id: 'calcalist', name: { en: 'Calcalist', he: 'כלכליסט' }, category: 'news' },
  tinder: { id: 'tinder', name: { en: 'Tinder', he: 'טינדר' }, category: 'dating' },
  hinge: { id: 'hinge', name: { en: 'Hinge', he: 'Hinge' }, category: 'dating' },
  holmes_place: { id: 'holmes_place', name: { en: 'Holmes Place', he: 'הולמס פלייס' }, category: 'gym' },
  go_active: { id: 'go_active', name: { en: 'Go Active', he: 'גו אקטיב' }, category: 'gym' },
};

export const listSubscriptionProviders = () =>
  SUBSCRIPTION_PROVIDER_IDS.map(id => SUBSCRIPTION_PROVIDERS[id]);
