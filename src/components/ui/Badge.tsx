import type { InvestmentProfile, RiskLevel, Recommendation, TransportClassification } from '../../types/city';

const PROFILE_STYLES: Record<InvestmentProfile, { label: string; cls: string }> = {
  YIELD_TRAP: { label: 'Piège rendement', cls: 'bg-red-950 text-red-400 border-red-900' },
  CASHFLOW_OPPORTUNITY: { label: 'Cashflow', cls: 'bg-emerald-950 text-emerald-400 border-emerald-900' },
  BEGINNER_FRIENDLY: { label: 'Débutant', cls: 'bg-blue-950 text-blue-400 border-blue-900' },
  PATRIMONIAL_SAFE: { label: 'Patrimonial', cls: 'bg-violet-950 text-violet-400 border-violet-900' },
  LONG_TERM_POTENTIAL: { label: 'Long terme', cls: 'bg-cyan-950 text-cyan-400 border-cyan-900' },
  BALANCED_OPPORTUNITY: { label: 'Équilibré', cls: 'bg-teal-950 text-teal-400 border-teal-900' },
  LOW_INTEREST: { label: 'Faible intérêt', cls: 'bg-slate-800 text-slate-400 border-slate-700' },
  DATA_INCOMPLETE: { label: 'Données incomplètes', cls: 'bg-amber-950 text-amber-400 border-amber-900' },
};

const RISK_STYLES: Record<RiskLevel, { label: string; cls: string; dot: string }> = {
  LOW: { label: 'Risque faible', cls: 'bg-emerald-950 text-emerald-400 border-emerald-900', dot: 'bg-emerald-400' },
  MODERATE: { label: 'Risque modéré', cls: 'bg-amber-950 text-amber-400 border-amber-900', dot: 'bg-amber-400' },
  HIGH: { label: 'Risque élevé', cls: 'bg-orange-950 text-orange-400 border-orange-900', dot: 'bg-orange-400' },
  VERY_HIGH: { label: 'Risque très élevé', cls: 'bg-red-950 text-red-400 border-red-900', dot: 'bg-red-400' },
};

const RECO_STYLES: Record<Recommendation, { label: string; cls: string }> = {
  STRONG_OPPORTUNITY: { label: 'Forte opportunité', cls: 'bg-emerald-950 text-emerald-400 border-emerald-900' },
  GOOD_TO_ANALYZE: { label: 'À analyser', cls: 'bg-blue-950 text-blue-400 border-blue-900' },
  ONLY_EXPERIENCED: { label: 'Expérimenté uniquement', cls: 'bg-amber-950 text-amber-400 border-amber-900' },
  AVOID_FOR_BEGINNER: { label: 'Éviter si débutant', cls: 'bg-orange-950 text-orange-400 border-orange-900' },
  AVOID: { label: 'À éviter', cls: 'bg-red-950 text-red-400 border-red-900' },
  DATA_TO_VERIFY: { label: 'Données à vérifier', cls: 'bg-slate-800 text-slate-400 border-slate-700' },
};

const TRANSPORT_STYLES: Record<TransportClassification, { label: string; cls: string }> = {
  ISOLATED: { label: 'Isolée', cls: 'bg-red-950 text-red-400 border-red-900' },
  LOW: { label: 'Transport faible', cls: 'bg-orange-950 text-orange-400 border-orange-900' },
  MODERATE: { label: 'Transport moyen', cls: 'bg-amber-950 text-amber-400 border-amber-900' },
  GOOD: { label: 'Bien desservie', cls: 'bg-blue-950 text-blue-400 border-blue-900' },
  EXCELLENT: { label: 'Excellent transport', cls: 'bg-emerald-950 text-emerald-400 border-emerald-900' },
};

interface BadgeProps {
  className?: string;
  small?: boolean;
}

export function ProfileBadge({ profile, small }: BadgeProps & { profile: InvestmentProfile }) {
  const s = PROFILE_STYLES[profile];
  if (!s) return null;
  return (
    <span className={`inline-flex items-center border rounded-full font-medium ${small ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'} ${s.cls}`}>
      {s.label}
    </span>
  );
}

export function RiskBadge({ risk, small }: BadgeProps & { risk: RiskLevel }) {
  const s = RISK_STYLES[risk];
  if (!s) return null;
  return (
    <span className={`inline-flex items-center gap-1 border rounded-full font-medium ${small ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'} ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function RecoBadge({ reco, small }: BadgeProps & { reco: Recommendation }) {
  const s = RECO_STYLES[reco];
  if (!s) return null;
  return (
    <span className={`inline-flex items-center border rounded-full font-medium ${small ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'} ${s.cls}`}>
      {s.label}
    </span>
  );
}

export function TransportBadge({ classification, small }: BadgeProps & { classification: TransportClassification }) {
  const s = TRANSPORT_STYLES[classification];
  if (!s) return null;
  return (
    <span className={`inline-flex items-center border rounded-full font-medium ${small ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'} ${s.cls}`}>
      {s.label}
    </span>
  );
}

export function YieldBadge({ value, small }: BadgeProps & { value: number | null | undefined }) {
  if (value == null || isNaN(value)) return <span className="text-slate-500 text-xs">—</span>;
  const cls = value >= 8 ? 'bg-emerald-950 text-emerald-400 border-emerald-900'
    : value >= 6 ? 'bg-blue-950 text-blue-400 border-blue-900'
    : value >= 4 ? 'bg-amber-950 text-amber-400 border-amber-900'
    : 'bg-red-950 text-red-400 border-red-900';
  const label = value >= 8 ? 'Excellent' : value >= 6 ? 'Bon' : value >= 4 ? 'Moyen' : 'Faible';
  return (
    <span className={`inline-flex items-center gap-1 border rounded-full font-medium ${small ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'} ${cls}`}>
      {label} {value.toFixed(1)}%
    </span>
  );
}

export function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="inline-flex items-center bg-slate-800 text-slate-400 border border-slate-700 rounded-full text-[10px] px-2 py-0.5 font-medium">
      {tag}
    </span>
  );
}
