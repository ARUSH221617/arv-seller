import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format plain numbers according to active locale (Persian numerals for 'fa', standard for others)
 */
export function formatNumber(num: number | string | undefined | null, lang: string = 'fa'): string {
  if (num === undefined || num === null || num === '') return '';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return String(num);
  return new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : (lang === 'ar' ? 'ar-SA' : 'en-US'), { useGrouping: false }).format(n);
}

/**
 * Convert any digits inside a string to Persian/Arabic digits according to active locale
 */
export function toPersianDigits(str: string | number | undefined | null, lang: string = 'fa'): string {
  if (str === undefined || str === null) return '';
  const s = String(str);
  if (lang !== 'fa' && lang !== 'ar') return s;
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const map = lang === 'fa' ? persianDigits : arabicDigits;
  return s.replace(/[0-9]/g, (d) => map[parseInt(d, 10)]);
}

/**
 * Format currency amount according to active locale
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
