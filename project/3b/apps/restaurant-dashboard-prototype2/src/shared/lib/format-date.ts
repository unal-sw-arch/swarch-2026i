type FormatDateOptions = {
  locale?: string;
  fallback?: string;
};

export function formatDate(value?: string | null, options: FormatDateOptions = {}): string {
  const { locale = "es-ES", fallback = "Fecha no disponible" } = options;

  if (!value) {
    return fallback;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
