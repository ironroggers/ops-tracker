export function coerceFiniteNumber(input, fallback = 0) {
  const n = typeof input === 'string' ? Number(input.replace(/[,\s]/g, '')) : Number(input);
  return Number.isFinite(n) ? n : fallback;
}

export function formatCompactNumber(value, { maximumFractionDigits = 2 } = {}) {
  const n = coerceFiniteNumber(value, 0);
  return new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits,
  }).format(n);
}

export function formatCompactCurrency(value, { currency = 'USD', withSymbol = true, maximumFractionDigits = 2 } = {}) {
  const n = coerceFiniteNumber(value, 0);
  if (!withSymbol) {
    return formatCompactNumber(n, { maximumFractionDigits });
  }
  // Some locales omit symbol spacing; add a thin space if needed
  const formatted = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits,
  }).format(n);
  return formatted.replace(/([^\d\s])(?=\d)/, '$1 ');
} 