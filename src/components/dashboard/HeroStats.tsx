import { BarChart2, TrendingUp, ShieldAlert, Users, Zap, AlertTriangle, Train, Star } from 'lucide-react';
import type { GlobalStats } from '../../lib/statistics';
import { MetricCard } from '../ui/MetricCard';
import { fmt } from '../../lib/formatters';

interface Props {
  stats: GlobalStats;
  onNavigate: (page: string) => void;
}

export function HeroStats({ stats, onNavigate }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
      <MetricCard
        label="Communes analysées"
        value={String(stats.total)}
        sub="Île-de-France"
        icon={<BarChart2 size={16} />}
        accent="text-blue-400"
      />
      <MetricCard
        label="Rendement moyen appt"
        value={fmt.pct(stats.avgAptYield)}
        sub="brut annuel"
        icon={<TrendingUp size={16} />}
        accent="text-emerald-400"
      />
      <MetricCard
        label="Rendement moyen maison"
        value={fmt.pct(stats.avgHouseYield)}
        sub="brut annuel"
        icon={<TrendingUp size={16} />}
        accent="text-teal-400"
      />
      <MetricCard
        label="Score global moyen"
        value={fmt.score(stats.avgGlobalScore)}
        sub="sur 100"
        icon={<Star size={16} />}
        accent="text-amber-400"
      />
      <MetricCard
        label="Opportunités cashflow"
        value={String(stats.countCashflow)}
        sub={`sur ${stats.total} communes`}
        icon={<Zap size={16} />}
        accent="text-emerald-400"
        onClick={() => onNavigate('opportunities')}
      />
      <MetricCard
        label="Pièges rendement"
        value={String(stats.countYieldTrap)}
        sub="à éviter pour débutants"
        icon={<AlertTriangle size={16} />}
        accent="text-red-400"
      />
      <MetricCard
        label="Communes débutant"
        value={String(stats.countBeginnerFriendly)}
        sub="profil sécurisé"
        icon={<Users size={16} />}
        accent="text-blue-400"
        onClick={() => onNavigate('profiles')}
      />
      <MetricCard
        label="Communes isolées"
        value={String(stats.countIsolated)}
        sub="transport insuffisant"
        icon={<Train size={16} />}
        accent="text-slate-500"
      />
      <MetricCard
        label="Risque élevé/très élevé"
        value={String(stats.countHighRisk)}
        sub="communes à risque fort"
        icon={<ShieldAlert size={16} />}
        accent="text-orange-400"
      />
      <MetricCard
        label="Rendement > 8%"
        value={String(stats.countHighYield)}
        sub={`dont ${stats.countHighYieldSafe} sécurisées`}
        icon={<TrendingUp size={16} />}
        accent="text-emerald-400"
        onClick={() => onNavigate('opportunities')}
      />
      {stats.topGlobalCity && (
        <MetricCard
          label="Meilleure ville (score)"
          value={stats.topGlobalCity.city}
          sub={`Score ${fmt.score(stats.topGlobalCity.investment?.globalScore)}`}
          icon={<Star size={16} />}
          accent="text-yellow-400"
        />
      )}
      {stats.topCashflowCity && (
        <MetricCard
          label="Meilleure ville cashflow"
          value={stats.topCashflowCity.city}
          sub={`${fmt.pct(stats.topCashflowCity.prices.apartment.grossYield)} rendement appt`}
          icon={<Zap size={16} />}
          accent="text-emerald-400"
        />
      )}
    </div>
  );
}
