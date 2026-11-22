const AGOROT_CURRENCY = 'ILA';
const SHEKEL_CURRENCY = 'ILS';
const AGOROT_PER_SHEKEL = 100;

// Yahoo quotes TASE listings in agorot; nothing outside the provider should ever see them.
export const isAgorot = (currency: string) => currency.toUpperCase() === AGOROT_CURRENCY;

export const normalizeCurrency = (currency: string) =>
  isAgorot(currency) ? SHEKEL_CURRENCY : currency.toUpperCase();

export const normalizePrice = (price: number, currency: string) =>
  isAgorot(currency) ? price / AGOROT_PER_SHEKEL : price;
