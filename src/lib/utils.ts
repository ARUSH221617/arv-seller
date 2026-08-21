import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format numbers according to active locale (Persian numerals for 'fa', standard for others)
 */
export function formatCurrency(amount: number | undefined | null, currency: string = 'IRT', lang: string = 'fa'): string {
  const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const rounded = Math.round(validAmount);
  const formattedNumber = new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : (lang === 'ar' ? 'ar-SA' : 'en-US')).format(rounded);
  
  if (currency === 'IRT') {
    return lang === 'fa' || lang === 'ar' ? `${formattedNumber} تومان` : `${formattedNumber} Toman`;
  }
  if (currency === 'IRR') {
    return lang === 'fa' || lang === 'ar' ? `${formattedNumber} ریال` : `${formattedNumber} Rial`;
  }
  return `$${formattedNumber}`;
}

/**
 * Format date string
 */
export function formatDate(dateString: string, lang: string = 'fa'): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat(lang === 'fa' ? 'fa-IR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}
