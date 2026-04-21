type FormatCurrencyOptions = {
  currency?: string;
  locale?: string;
  fallback?: string;
};

export function formatCurrency(value: number, options: FormatCurrencyOptions = {}): string {
  const { currency = "USD", locale = "es-ES", fallback = "-" } = options;

  if (!Number.isFinite(value)) {
    return fallback;
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}
