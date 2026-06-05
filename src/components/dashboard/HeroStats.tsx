import { BarChart2, TrendingUp, ShieldAlert, Users, Zap, AlertTriangle, Star } from 'lucide-react';
import type { DashboardStats } from '../../lib/statistics';
import { MetricCard } from '../ui/MetricCard';
import { fmt } from '../../lib/formatters';

interface Props { stats: DashboardStats; onNavigate: (page: string) => void; }

export function HeroStats({ stats, onNavigate }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
      <MetricCard label="Communes analysées"     value={stats.total.toLocaleString('fr-FR')}           sub="France entière"                            icon={<BarChart2 size={16} />}    accent="text-blue-600 dark:text-blue-400" />
      <MetricCard label="Rendement moyen appt"    value={stats.avgAptYield != null ? fmt.pct(stats.avgAptYield) : '—'} sub="brut annuel"            icon={<TrendingUp size={16} />}   accent="text-emerald-600 dark:text-emerald-400" />
      <MetricCard label="Score global moyen"      value={fmt.score(stats.avgGlobalScore)}               sub="sur 100"                                   icon={<Star size={16} />}         accent="text-amber-600 dark:text-amber-400" />
      <MetricCard label="Opportunités cashflow"   value={String(stats.countCashflow)}                   sub={`profil HIGH_YIELD`}                       icon={<Zap size={16} />}          accent="text-emerald-600 dark:text-emerald-400" onClick={() => onNavigate('opportunities')} />
      <MetricCard label="Pièges rendement"        value={String(stats.countYieldTrap)}                  sub="rendement trompeur"                        icon={<AlertTriangle size={16} />} accent="text-red-600 dark:text-red-400" />
      <MetricCard label="Communes débutant"       value={String(stats.countBeginnerFriendly)}           sub="profil sécurisé"                           icon={<Users size={16} />}        accent="text-blue-600 dark:text-blue-400" onClick={() => onNavigate('profiles')} />
      <MetricCard label="Risque élevé"            value={String(stats.countHighRisk)}                   sub="communes à risque fort"                    icon={<ShieldAlert size={16} />}  accent="text-orange-600 dark:text-orange-400" />
      <MetricCard label="Rendement > 8%"          value={String(stats.countHighYield)}                  sub="fort rendement brut"                       icon={<TrendingUp size={16} />}   accent="text-emerald-600 dark:text-emerald-400" onClick={() => onNavigate('opportunities')} />
      {stats.topGlobalCity && (
        <MetricCard label="Meilleure ville (score)" value={stats.topGlobalCity.city} sub={`Score ${stats.topGlobalCity.globalScore}/100`} icon={<Star size={16} />} accent="text-amber-600 dark:text-amber-400" />
      )}
      {stats.topCashflowCity && (
        <MetricCard label="Meilleure ville cashflow" value={stats.topCashflowCity.city} sub={`${stats.topCashflowCity.apartmentYield?.toFixed(1) ?? '—'}% rendement appt`} icon={<Zap size={16} />} accent="text-emerald-600 dark:text-emerald-400" />
      )}
    </div>
  );
}
