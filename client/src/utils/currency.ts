export const formatCurrency = (value: number, currency: string, locale = 'he-IL') =>
  value
    .toLocaleString(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
    .replace(/\s+/g, '');
