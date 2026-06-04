import type { InvestmentProfile, RiskLevel, Recommendation, TransportClassification } from '../../types/city';

// Human-readable labels: accessible to both pros and general public
const PROFILE_STYLES: Record<InvestmentProfile, { label: string; cls: string }> = {
  YIELD_TRAP:           { label: '⚠️ Rendement trompeur',    cls: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900' },
  CASHFLOW_OPPORTUNITY: { label: '💰 Cashflow +',            cls: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900' },
  BEGINNER_FRIENDLY:    { label: '🎯 Idéal débutant',        cls: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900' },
  PATRIMONIAL_SAFE:     { label: '🏛️ Valeur patrimoniale',   cls: 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-900' },
  LONG_TERM_POTENTIAL:  { label: '📈 Long terme',            cls: 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900' },
  BALANCED_OPPORTUNITY: { label: '⚖️ Équilibré',             cls: 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-900' },
  LOW_INTEREST:         { label: '😐 Peu intéressant',       cls: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700' },
  DATA_INCOMPLETE:      { label: '❓ À vérifier',            cls: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900' },
};

const RISK_STYLES: Record<RiskLevel, { label: string; cls: string; dot: string }> = {
  LOW:       { label: 'Risque faible',     cls: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900', dot: 'bg-emerald-500' },
  MODERATE:  { label: 'Risque modéré',     cls: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900',             dot: 'bg-amber-500' },
  HIGH:      { label: 'Risqué',            cls: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900',         dot: 'bg-orange-500' },
  VERY_HIGH: { label: '🚨 Très risqué',   cls: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900',                           dot: 'bg-red-500' },
};

const RECO_STYLES: Record<Recommendation, { label: string; cls: string }> = {
  STRONG_OPPORTUNITY: { label: '⭐ À saisir',              cls: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900' },
  GOOD_TO_ANALYZE:    { label: '🔍 À étudier',             cls: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900' },
  ONLY_EXPERIENCED:   { label: '⚡ Experts seulement',     cls: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900' },
  AVOID_FOR_BEGINNER: { label: '⚠️ Pas pour débutants',   cls: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900' },
  AVOID:              { label: '❌ À éviter',              cls: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900' },
  DATA_TO_VERIFY:     { label: '❓ Données à vérifier',    cls: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700' },
};

const TRANSPORT_STYLES: Record<TransportClassification, { label: string; cls: string }> = {
  ISOLATED:  { label: '🚗 Voiture obligatoire',  cls: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900' },
  LOW:       { label: '😐 Transport limité',     cls: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900' },
  MODERATE:  { label: '🚌 Transport correct',    cls: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900' },
  GOOD:      { label: '🚊 Bien desservie',       cls: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900' },
  EXCELLENT: { label: '🚀 Excellent transport',  cls: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900' },
};

interface BadgeProps { className?: string; small?: boolean; }

export function ProfileBadge({ profile, small }: BadgeProps & { profile: InvestmentProfile }) {
  const s = PROFILE_STYLES[profile];
  if (!s) return null;
  return <span className={`inline-flex items-center border rounded-full font-medium whitespace-nowrap ${small ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'} ${s.cls}`}>{s.label}</span>;
}

export function RiskBadge({ risk, small }: BadgeProps & { risk: RiskLevel }) {
  const s = RISK_STYLES[risk];
  if (!s) return null;
  return (
    <span className={`inline-flex items-center gap-1 border rounded-full font-medium whitespace-nowrap ${small ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'} ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function RecoBadge({ reco, small }: BadgeProps & { reco: Recommendation }) {
  const s = RECO_STYLES[reco];
  if (!s) return null;
  return <span className={`inline-flex items-center border rounded-full font-medium whitespace-nowrap ${small ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'} ${s.cls}`}>{s.label}</span>;
}

export function TransportBadge({ classification, small }: BadgeProps & { classification: TransportClassification }) {
  const s = TRANSPORT_STYLES[classification];
  if (!s) return null;
  return <span className={`inline-flex items-center border rounded-full font-medium whitespace-nowrap ${small ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'} ${s.cls}`}>{s.label}</span>;
}

export function YieldBadge({ value, small }: BadgeProps & { value: number | null | undefined }) {
  if (value == null || isNaN(value)) return <span className="t-muted text-xs">—</span>;
  const cls = value >= 8
    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
    : value >= 6
    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900'
    : value >= 4
    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900'
    : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900';
  const label = value >= 8 ? '🔥 Élevé' : value >= 6 ? '✅ Bon' : value >= 4 ? '⚠️ Moyen' : '↓ Faible';
  return (
    <span className={`inline-flex items-center gap-1 border rounded-full font-medium whitespace-nowrap ${small ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'} ${cls}`}>
      {label} · {value.toFixed(1)}%
    </span>
  );
}

export function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="inline-flex items-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-full text-[10px] px-2 py-0.5 font-medium">
      {tag}
    </span>
  );
}
