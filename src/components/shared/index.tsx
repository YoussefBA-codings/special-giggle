import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  MapPin,
} from 'lucide-react';
import type { CommuneIndex } from '../../types/api';
import { fmt, n } from '../../lib/formatters';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-blue-600 dark:text-blue-400';
  if (score >= 40) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function scoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
  if (score >= 60) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  if (score >= 40) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
  return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
}

function riskBg(level: 'LOW' | 'MEDIUM' | 'HIGH'): string {
  if (level === 'LOW') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
  if (level === 'MEDIUM') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
  return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
}

function riskLabel(level: 'LOW' | 'MEDIUM' | 'HIGH'): string {
  if (level === 'LOW') return 'Risque faible';
  if (level === 'MEDIUM') return 'Risque modéré';
  return 'Risque élevé';
}

function rankMedal(rank: number): { bg: string; text: string; label: string } {
  if (rank === 1) return { bg: 'bg-yellow-400 dark:bg-yellow-500', text: 'text-yellow-900', label: '1' };
  if (rank === 2) return { bg: 'bg-slate-300 dark:bg-slate-500', text: 'text-slate-900 dark:text-slate-100', label: '2' };
  if (rank === 3) return { bg: 'bg-orange-400 dark:bg-orange-500', text: 'text-orange-900', label: '3' };
  return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400', label: String(rank) };
}

type MetricKey = 'global' | 'cashflow' | 'yield' | 'patrimonial' | 'beginner' | 'risk' | 'longTerm' | 'rentalDemand';

function getMetricScore(city: CommuneIndex, metric: MetricKey): number {
  switch (metric) {
    case 'global':       return n(city.globalScore);
    case 'cashflow':     return n(city.cashflowScore);
    case 'yield':        return n(city.yieldScore);
    case 'patrimonial':  return n(city.patrimonialScore);
    case 'beginner':     return n(city.beginnerScore);
    case 'risk':         return n(city.riskScore);
    case 'longTerm':     return n(city.longTermScore);
    case 'rentalDemand': return n(city.rentalDemandScore);
    default:             return n(city.globalScore);
  }
}

function getMetricLabel(metric: MetricKey): string {
  switch (metric) {
    case 'global':       return 'Score global';
    case 'cashflow':     return 'Cashflow';
    case 'yield':        return 'Rendement';
    case 'patrimonial':  return 'Patrimonial';
    case 'beginner':     return 'Débutant';
    case 'risk':         return 'Risque';
    case 'longTerm':     return 'Long terme';
    case 'rentalDemand': return 'Demande loc.';
    default:             return 'Score';
  }
}

// ---------------------------------------------------------------------------
// TerritoryMiniCard
// ---------------------------------------------------------------------------

export interface TerritoryMiniCardProps {
  city: CommuneIndex;
  rank?: number;
  metric?: MetricKey;
  showRegion?: boolean;
  onCityClick: (inseeCode: string) => void;
}

export function TerritoryMiniCard({
  city,
  rank,
  metric = 'global',
  showRegion = false,
  onCityClick,
}: TerritoryMiniCardProps) {
  const score = getMetricScore(city, metric);
  const price = city.apartmentPrice ?? city.housePrice ?? null;
  const yieldVal = city.apartmentYield ?? city.houseYield ?? null;
  const medal = rank != null ? rankMedal(rank) : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onCityClick(city.inseeCode)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onCityClick(city.inseeCode)}
      className="card card-hover flex items-center gap-3 px-3 py-2.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {/* Rank badge */}
      {medal && (
        <span
          className={`shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-black ${medal.bg} ${medal.text}`}
        >
          {medal.label}
        </span>
      )}

      {/* City name + location */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm font-semibold t-primary truncate">{city.city}</span>
          <span className="shrink-0 text-xs font-medium text-slate-400 dark:text-slate-500">
            ({city.department})
          </span>
        </div>
        {showRegion && (
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="text-[11px] t-muted truncate">{city.region}</span>
          </div>
        )}
      </div>

      {/* Score badge */}
      <span
        className={`shrink-0 inline-flex items-center rounded-full text-[11px] font-bold px-2 py-0.5 ${scoreBg(score)}`}
        title={getMetricLabel(metric)}
      >
        {Math.round(score)}
      </span>

      {/* Yield */}
      <span className="shrink-0 hidden sm:block text-xs font-semibold t-secondary w-14 text-right tabular-nums">
        {yieldVal != null ? fmt.pct(yieldVal) : '—'}
      </span>

      {/* Price */}
      <span className="shrink-0 hidden md:block text-xs t-muted w-20 text-right tabular-nums">
        {price != null ? fmt.eur(price) : '—'}
      </span>

      {/* Risk badge */}
      <span
        className={`shrink-0 hidden sm:inline-flex items-center rounded-full text-[10px] font-semibold px-1.5 py-0.5 ${riskBg(city.riskLevel)}`}
      >
        {riskLabel(city.riskLevel)}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KpiCard
// ---------------------------------------------------------------------------

export interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: number;
}

export function KpiCard({ label, value, sub, icon, color = 'text-blue-600 dark:text-blue-400', trend }: KpiCardProps) {
  const trendPositive = trend != null && trend > 0;
  const trendNeutral  = trend != null && trend === 0;
  const trendNegative = trend != null && trend < 0;

  return (
    <div className="card p-4 flex items-start gap-3">
      {icon && (
        <div className={`shrink-0 p-2 rounded-lg elevated ${color}`}>
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="label-xs mb-0.5">{label}</p>
        <p className="text-xl font-black t-primary leading-tight">{value}</p>
        {sub && <p className="text-xs t-muted mt-0.5 truncate">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div
          className={`shrink-0 flex items-center gap-0.5 text-xs font-semibold ${
            trendPositive
              ? 'text-emerald-600 dark:text-emerald-400'
              : trendNegative
              ? 'text-red-600 dark:text-red-400'
              : 't-muted'
          }`}
        >
          {trendPositive && <TrendingUp className="w-3.5 h-3.5" />}
          {trendNegative && <TrendingDown className="w-3.5 h-3.5" />}
          {trendNeutral  && <Minus className="w-3.5 h-3.5" />}
          <span>{trendPositive ? '+' : ''}{trend?.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ScoreBar
// ---------------------------------------------------------------------------

export interface ScoreBarProps {
  score: number | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const SIZE_CLASSES = {
  sm: { bar: 'h-1',   text: 'text-[10px]', value: 'text-xs'  },
  md: { bar: 'h-1.5', text: 'text-xs',     value: 'text-sm'  },
  lg: { bar: 'h-2',   text: 'text-sm',     value: 'text-base' },
};

function barColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500 dark:bg-emerald-400';
  if (score >= 60) return 'bg-blue-500 dark:bg-blue-400';
  if (score >= 40) return 'bg-amber-500 dark:bg-amber-400';
  return 'bg-red-500 dark:bg-red-400';
}

export function ScoreBar({ score, size = 'md', label }: ScoreBarProps) {
  const s = SIZE_CLASSES[size];
  const safeScore = score != null && !isNaN(score) ? Math.max(0, Math.min(100, Math.round(score))) : null;

  return (
    <div className="flex flex-col gap-1 w-full">
      {(label || safeScore != null) && (
        <div className="flex items-center justify-between gap-2">
          {label && <span className={`${s.text} t-muted truncate`}>{label}</span>}
          <span className={`${s.value} font-bold shrink-0 ${safeScore != null ? scoreColor(safeScore) : 't-muted'}`}>
            {safeScore != null ? `${safeScore}/100` : '—'}
          </span>
        </div>
      )}
      <div className={`w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ${s.bar}`}>
        {safeScore != null && (
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor(safeScore)}`}
            style={{ width: `${safeScore}%` }}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// InsightPill
// ---------------------------------------------------------------------------

export type InsightType = 'positive' | 'negative' | 'neutral' | 'warning';

export interface InsightPillProps {
  text: string;
  type?: InsightType;
}

const INSIGHT_STYLES: Record<InsightType, { cls: string; Icon: React.ElementType }> = {
  positive: {
    cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
    Icon: CheckCircle,
  },
  negative: {
    cls: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800',
    Icon: XCircle,
  },
  warning: {
    cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
    Icon: AlertTriangle,
  },
  neutral: {
    cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
    Icon: Info,
  },
};

export function InsightPill({ text, type = 'neutral' }: InsightPillProps) {
  const { cls, Icon } = INSIGHT_STYLES[type];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full text-[11px] font-medium px-2.5 py-1 ${cls}`}>
      <Icon className="w-3 h-3 shrink-0" />
      <span>{text}</span>
    </span>
  );
}
