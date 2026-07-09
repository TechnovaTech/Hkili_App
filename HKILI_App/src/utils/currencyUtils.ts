/**
 * Country → currency + price formatting.
 *
 * ⚠️ The conversion rates below are STATIC placeholders (relative to INR, the
 * currency the coin plans are authored in). They exist so prices display in the
 * user's local currency for the stubbed checkout. Before launch, replace this
 * with either (a) per-currency prices authored on each Plan, or (b) the app
 * store's own localized IAP pricing (recommended — Apple/Google handle FX,
 * taxes, and rounding automatically).
 */

export interface CountryOption {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  currency: string;
}

// Curated shortlist — extend as needed.
export const COUNTRIES: CountryOption[] = [
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'IN', name: 'India', currency: 'INR' },
  { code: 'FR', name: 'France', currency: 'EUR' },
  { code: 'DE', name: 'Germany', currency: 'EUR' },
  { code: 'ES', name: 'Spain', currency: 'EUR' },
  { code: 'MA', name: 'Morocco', currency: 'MAD' },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED' },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR' },
  { code: 'EG', name: 'Egypt', currency: 'EGP' },
  { code: 'CA', name: 'Canada', currency: 'CAD' },
  { code: 'AU', name: 'Australia', currency: 'AUD' },
];

interface CurrencyMeta {
  symbol: string;
  rateFromINR: number; // 1 INR = rateFromINR of this currency
}

const CURRENCY_META: Record<string, CurrencyMeta> = {
  INR: { symbol: '₹', rateFromINR: 1 },
  USD: { symbol: '$', rateFromINR: 0.012 },
  EUR: { symbol: '€', rateFromINR: 0.011 },
  GBP: { symbol: '£', rateFromINR: 0.0095 },
  AED: { symbol: 'AED ', rateFromINR: 0.044 },
  SAR: { symbol: 'SAR ', rateFromINR: 0.045 },
  MAD: { symbol: 'MAD ', rateFromINR: 0.12 },
  EGP: { symbol: 'EGP ', rateFromINR: 0.58 },
  CAD: { symbol: 'C$', rateFromINR: 0.016 },
  AUD: { symbol: 'A$', rateFromINR: 0.018 },
};

const DEFAULT_CURRENCY = 'USD';

export function currencyForCountry(country?: string): string {
  if (!country) return DEFAULT_CURRENCY;
  const match = COUNTRIES.find((c) => c.code === country.toUpperCase());
  return match?.currency || DEFAULT_CURRENCY;
}

export function countryName(country?: string): string {
  if (!country) return '';
  return COUNTRIES.find((c) => c.code === country.toUpperCase())?.name || country;
}

/**
 * Format a base (INR) price into the user's local currency.
 * `amountInINR` is the value stored on the Plan (originalPrice/discountPrice).
 */
export function formatPrice(amountInINR: number, country?: string): string {
  const currency = currencyForCountry(country);
  const meta = CURRENCY_META[currency] || CURRENCY_META[DEFAULT_CURRENCY];
  const converted = amountInINR * meta.rateFromINR;
  // Show 2 decimals for small values, whole numbers for larger ones.
  const value = converted >= 100 ? Math.round(converted) : Math.round(converted * 100) / 100;
  return `${meta.symbol}${value}`;
}
