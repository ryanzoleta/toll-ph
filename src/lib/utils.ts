import type { Action } from './types';

export function capitalize(str: string | null) {
  if (str) return str.charAt(0).toUpperCase() + str.slice(1);
  return '';
}

export function stringifyEnum(str: string | null) {
  if (str) {
    const parts = str.split('_');

    for (let i = 0; i < parts.length; i++) {
      parts[i] = capitalize(parts[i].toLowerCase());
    }

    return parts.join(' ');
  }
  return '';
}

export function formatAmountToCurrency(amount: number, currencySymbol?: string): string {
  const userLang = navigator.language ?? 'en-US';
  const currencyNumber = new Intl.NumberFormat(userLang, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);

  if (currencySymbol) {
    return `${currencySymbol} ${currencyNumber}`;
  }
  return `₱${currencyNumber}`;
}
