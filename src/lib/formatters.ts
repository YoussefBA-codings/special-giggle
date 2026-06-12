export const fmt = {
  eur: (v: number | null | undefined): string => {
    if (v == null || isNaN(v) || v === 0) return '-';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
  },
  pct: (v: number | null | undefined, decimals = 2): string => {
    if (v == null || isNaN(v)) return '-';
    return `${v.toFixed(decimals)}%`;
  },
  num: (v: number | null | undefined): string => {
    if (v == null || isNaN(v)) return '-';
    return new Intl.NumberFormat('fr-FR').format(v);
  },
  km: (v: number | null | undefined): string => {
    if (v == null || isNaN(v)) return '-';
    return `${v.toFixed(1)} km`;
  },
  income: (v: number | null | undefined): string => {
    if (v == null || isNaN(v)) return '-';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v) + '/an';
  },
  score: (v: number | null | undefined): string => {
    if (v == null || isNaN(v)) return '-';
    return `${Math.round(v)}/100`;
  },
  growth: (v: number | null | undefined): string => {
    if (v == null || isNaN(v)) return '-';
    const sign = v > 0 ? '+' : '';
    return `${sign}${v.toFixed(1)}%`;
  },
};

export function n(v: number | null | undefined, fallback = 0): number {
  if (v == null || isNaN(v)) return fallback;
  return v;
}

export function avg(values: (number | null | undefined)[]): number {
  const valid = values.filter((v): v is number => v != null && !isNaN(v) && isFinite(v));
  if (valid.length === 0) return 0;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

export function median(values: (number | null | undefined)[]): number {
  const valid = values.filter((v): v is number => v != null && !isNaN(v) && isFinite(v)).sort((a, b) => a - b);
  if (valid.length === 0) return 0;
  const mid = Math.floor(valid.length / 2);
  return valid.length % 2 !== 0 ? valid[mid] : (valid[mid - 1] + valid[mid]) / 2;
}
