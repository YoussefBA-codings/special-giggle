import { useEffect, useState } from 'react';
import {
  MapPin,
  TrendingUp,
  Building2,
  BarChart3,
  Lightbulb,
  Search,
  GitCompare,
  ChevronRight,
  ArrowRight,
  Globe,
  Star,
  Zap,
  Shield,
  Target,
  Users,
} from 'lucide-react';
import { useNavigate, Link } from '../router';
import { fetchRegions, fetchCitiesPage, DEFAULT_QUALITY } from '../lib/api';
import { fmt, n } from '../lib/formatters';
import { scoreBg, scoreColor } from '../lib/insights';
import type { RegionSummary, CommuneIndex } from '../types/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function avgOf(regions: RegionSummary[], getter: (r: RegionSummary) => number | null): number {
  const vals = regions.map(getter).filter((v): v is number => v != null && isFinite(v));
  if (vals.length === 0) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}


function generateNationalInsights(
  regions: RegionSummary[],
): { icon: React.ReactNode; text: string }[] {
  if (regions.length === 0) return [];

  const insights: { icon: React.ReactNode; text: string }[] = [];

  const avgYield = avgOf(regions, (r) => r.avgApartmentYield);
  const avgScore = avgOf(regions, (r) => r.avgGlobalScore);
  const avgPrice = avgOf(regions, (r) => r.avgApartmentPrice);
  const highYieldRegions = regions.filter((r) => (r.avgApartmentYield ?? 0) >= 6).length;
  const totalPop = regions.reduce((acc, r) => acc + (r.population ?? 0), 0);
  const topRegion = regions[0];
  const bottomRegion = regions[regions.length - 1];

  if (topRegion) {
    insights.push({
      icon: <Star className="w-4 h-4 text-amber-500" />,
      text: `${topRegion.name} est la meilleure région pour investir avec un score moyen de ${Math.round(topRegion.avgGlobalScore)}/100`,
    });
  }

  if (avgYield > 0) {
    insights.push({
      icon: <TrendingUp className="w-4 h-4 text-emerald-500" />,
      text: `Rendement brut moyen national estimé à ${fmt.pct(avgYield)} :${highYieldRegions} région${highYieldRegions > 1 ? 's' : ''} dépassent les 6%`,
    });
  }

  if (avgPrice > 0) {
    insights.push({
      icon: <Building2 className="w-4 h-4 text-blue-500" />,
      text: `Prix moyen national de l'appartement : ${fmt.eur(Math.round(avgPrice))} :forte disparité entre régions`,
    });
  }

  if (avgScore > 0) {
    insights.push({
      icon: <BarChart3 className="w-4 h-4 text-violet-500" />,
      text: `Score global moyen toutes régions confondues : ${Math.round(avgScore)}/100 :niveau d'opportunité ${avgScore >= 55 ? 'élevé' : avgScore >= 40 ? 'modéré' : 'faible'}`,
    });
  }

  if (totalPop > 0) {
    insights.push({
      icon: <Users className="w-4 h-4 text-sky-500" />,
      text: `${fmt.num(totalPop)} habitants couverts sur ${regions.length} régions analysées :marché locatif profond`,
    });
  }

  if (bottomRegion && bottomRegion.slug !== topRegion?.slug) {
    insights.push({
      icon: <Shield className="w-4 h-4 text-slate-400" />,
      text: `Écart de ${Math.round((topRegion?.avgGlobalScore ?? 0) - (bottomRegion.avgGlobalScore ?? 0))} points entre la meilleure et la moins bonne région :choisissez bien votre zone`,
    });
  }

  return insights.slice(0, 6);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`card p-5 animate-pulse ${className}`}>
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-3" />
      <div className="h-7 bg-slate-100 dark:bg-slate-800 rounded w-24 mb-2" />
      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-20" />
    </div>
  );
}

interface HeroStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color?: string;
}

function HeroStatCard({ icon, label, value, sub, color = 'text-blue-600 dark:text-blue-400' }: HeroStatCardProps) {
  return (
    <div className="card p-4 sm:p-5 flex items-start gap-3">
      <div className={`p-2 rounded-lg elevated flex-shrink-0 ${color}`}>{icon}</div>
      <div className="min-w-0">
        <p className="label-xs t-muted mb-0.5">{label}</p>
        <p className={`text-xl font-bold leading-tight ${color}`}>{value}</p>
        {sub && <p className="text-xs t-secondary mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

interface MiniRankTableProps {
  title: string;
  icon: React.ReactNode;
  cities: CommuneIndex[];
  scoreGetter: (c: CommuneIndex) => number;
  rankingType: string;
  loading: boolean;
}

function MiniRankTable({ title, icon, cities, scoreGetter, rankingType, loading }: MiniRankTableProps) {
  const navigate = useNavigate();

  return (
    <div className="card p-4 flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="t-secondary">{icon}</span>
          <h3 className="text-sm font-semibold t-primary">{title}</h3>
        </div>
        <button
          onClick={() => navigate(`/rankings/${rankingType}`)}
          className="btn-ghost text-xs flex items-center gap-1"
        >
          Voir tout <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <ol className="space-y-1.5">
          {cities.slice(0, 5).map((city, idx) => {
            const score = scoreGetter(city);
            return (
              <li key={city.inseeCode}>
                <button
                  onClick={() => navigate(`/cities/${city.inseeCode}`)}
                  className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:elevated transition-colors group text-left"
                >
                  <span className="w-5 text-center text-xs font-bold t-muted flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium t-primary truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {city.city}
                    </p>
                    <p className="text-xs t-muted">{city.department}</p>
                  </div>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${scoreBg(score)}`}>
                    {Math.round(score)}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

interface RegionRowProps {
  rank: number;
  region: RegionSummary;
}

function RegionRow({ rank, region }: RegionRowProps) {
  const navigate = useNavigate();
  const score = region.avgGlobalScore ?? 0;

  return (
    <button
      onClick={() => navigate(`/regions/${region.slug}`)}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:elevated transition-colors group text-left"
    >
      <span className="w-5 text-center text-xs font-bold t-muted flex-shrink-0">{rank}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium t-primary truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {region.name}
        </p>
        <p className="text-xs t-muted">{fmt.num(region.communesCount)} communes</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs t-muted hidden sm:block">
          {region.avgApartmentYield != null ? fmt.pct(region.avgApartmentYield) : '—'}
        </span>
        <span className="text-xs t-muted hidden md:block">
          {region.avgApartmentPrice != null ? fmt.eur(Math.round(region.avgApartmentPrice)) : '—'}/m²
        </span>
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${scoreBg(score)}`}>
          {Math.round(score)}
        </span>
      </div>
    </button>
  );
}

// Simple SVG France silhouette (stylized outline)
function FranceSilhouette() {
  return (
    <svg
      viewBox="0 0 260 280"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 90 20
           L 130 10
           L 175 25
           L 215 55
           L 230 90
           L 250 115
           L 245 150
           L 225 175
           L 235 210
           L 210 250
           L 185 265
           L 155 270
           L 130 255
           L 110 265
           L 80 258
           L 55 240
           L 30 215
           L 15 185
           L 20 155
           L 10 125
           L 20 95
           L 45 65
           L 65 40
           Z"
        className="fill-blue-100 dark:fill-blue-900/30 stroke-blue-300 dark:stroke-blue-700"
        strokeWidth="2"
      />
      {/* Corsica */}
      <path
        d="M 215 225 L 225 215 L 235 220 L 230 235 L 220 240 Z"
        className="fill-blue-100 dark:fill-blue-900/30 stroke-blue-300 dark:stroke-blue-700"
        strokeWidth="1.5"
      />
      {/* City dots */}
      <circle cx="128" cy="95" r="4" className="fill-blue-500 dark:fill-blue-400" />
      <circle cx="100" cy="180" r="3" className="fill-emerald-500 dark:fill-emerald-400" />
      <circle cx="175" cy="195" r="3" className="fill-amber-500 dark:fill-amber-400" />
      <circle cx="65" cy="140" r="3" className="fill-violet-500 dark:fill-violet-400" />
      <circle cx="185" cy="130" r="3" className="fill-rose-500 dark:fill-rose-400" />
      <circle cx="140" cy="230" r="3" className="fill-sky-500 dark:fill-sky-400" />
      {/* City labels */}
      <text x="134" y="93" className="fill-blue-700 dark:fill-blue-300" fontSize="8" fontWeight="600">Paris</text>
      <text x="104" y="178" className="fill-emerald-700 dark:fill-emerald-300" fontSize="7">Bordeaux</text>
      <text x="178" y="193" className="fill-amber-700 dark:fill-amber-300" fontSize="7">Marseille</text>
      <text x="50" y="138" className="fill-violet-700 dark:fill-violet-300" fontSize="7">Nantes</text>
      <text x="188" y="128" className="fill-rose-700 dark:fill-rose-300" fontSize="7">Lyon</text>
      <text x="143" y="228" className="fill-sky-700 dark:fill-sky-300" fontSize="7">Toulouse</text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function FranceDashboardPage() {
  const navigate = useNavigate();

  const [regions, setRegions] = useState<RegionSummary[]>([]);
  const [rankGlobal, setRankGlobal] = useState<CommuneIndex[]>([]);
  const [rankCashflow, setRankCashflow] = useState<CommuneIndex[]>([]);
  const [rankYield, setRankYield] = useState<CommuneIndex[]>([]);
  const [rankPatrimonial, setRankPatrimonial] = useState<CommuneIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const q = DEFAULT_QUALITY;
    Promise.all([
      fetchRegions(),
      // Tous via fetchCitiesPage :les endpoints /rankings/* retournent max 3-5 résultats
      fetchCitiesPage({ minGlobalScore: 50, sortBy: 'globalScore',      sortOrder: 'desc', limit: 5, dataQuality: q }),
      fetchCitiesPage({ minGlobalScore: 40, sortBy: 'beginnerScore',    sortOrder: 'desc', limit: 5, dataQuality: q }),
      fetchCitiesPage({ minYield: 4, maxYield: 10, minGlobalScore: 40, sortBy: 'apartmentYield', sortOrder: 'desc', limit: 5, dataQuality: q }),
      fetchCitiesPage({ minGlobalScore: 45, sortBy: 'patrimonialScore', sortOrder: 'desc', limit: 5, dataQuality: q }),
    ])
      .then(([regionsData, globalRes, beginnerRes, yieldRes, patrimonialRes]) => {
        const safeFilter = (cities: CommuneIndex[]) =>
          cities.filter((c) => (c.apartmentYield ?? 0) <= 12 && c.profile !== 'YIELD_TRAP');
        setRegions(regionsData as RegionSummary[]);
        setRankGlobal(safeFilter(globalRes.data));
        setRankCashflow(safeFilter(beginnerRes.data));
        setRankYield(safeFilter(yieldRes.data));
        setRankPatrimonial(safeFilter(patrimonialRes.data));
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      })
      .finally(() => setLoading(false));
  }, []);

  // Derived
  const sortedRegions = [...regions].sort((a, b) => (b.avgGlobalScore ?? 0) - (a.avgGlobalScore ?? 0));
  const avgYield = avgOf(regions, (r) => r.avgApartmentYield);
  const avgPrice = avgOf(regions, (r) => r.avgApartmentPrice);
  const avgScore = avgOf(regions, (r) => r.avgGlobalScore);
  const insights = generateNationalInsights(sortedRegions);

  const totalCommunes = 34746;
  const totalRegions = 18;
  const totalDepts = 96;
  const medianPriceNational = avgPrice > 0 ? avgPrice : 3800;

  // ---------------------------------------------------------------------------
  // Loading skeleton
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-5 h-80 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-40 mb-4" />
              <div className="h-60 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4 space-y-2 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28 mb-3" />
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="h-9 bg-slate-100 dark:bg-slate-800 rounded" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Error state
  // ---------------------------------------------------------------------------

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center gap-4 min-h-64">
        <div className="card p-6 max-w-sm w-full text-center">
          <p className="text-red-500 font-semibold mb-2">Erreur de chargement</p>
          <p className="t-secondary text-sm mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary text-sm">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-screen-2xl mx-auto">

      {/* ------------------------------------------------------------------ */}
      {/* 1 :Hero stats bar                                                  */}
      {/* ------------------------------------------------------------------ */}

      <div>
        <div className="mb-3">
          <h1 className="text-xl font-bold t-primary flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            Tableau de bord national
          </h1>
          <p className="t-muted text-sm mt-0.5">
            Vue d'ensemble du marché immobilier investissement en France
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <HeroStatCard
            icon={<Building2 className="w-5 h-5" />}
            label="Communes analysées"
            value={fmt.num(totalCommunes)}
            sub="Toute la France métropolitaine"
            color="text-blue-600 dark:text-blue-400"
          />
          <HeroStatCard
            icon={<MapPin className="w-5 h-5" />}
            label="Régions"
            value={String(totalRegions)}
            sub={`${regions.length} dans la base`}
            color="text-violet-600 dark:text-violet-400"
          />
          <HeroStatCard
            icon={<BarChart3 className="w-5 h-5" />}
            label="Départements"
            value={String(totalDepts)}
            sub="France métropolitaine"
            color="text-emerald-600 dark:text-emerald-400"
          />
          <HeroStatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Prix médian national"
            value={`${Math.round(medianPriceNational).toLocaleString('fr-FR')} €/m²`}
            sub={avgYield > 0 ? `Rendement moyen ${fmt.pct(avgYield)}` : 'Appartements'}
            color="text-amber-600 dark:text-amber-400"
          />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2 :France snapshot (3 cols)                                        */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Left :France map placeholder */}
        <div className="card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold t-primary flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              Carte de France
            </h2>
            <button
              onClick={() => navigate('/map')}
              className="btn-ghost text-xs flex items-center gap-1"
            >
              Carte interactive <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-48 h-52 opacity-90">
              <FranceSilhouette />
            </div>
            <div className="w-full grid grid-cols-3 gap-2 mt-2">
              <div className="elevated rounded-lg p-2 text-center">
                <p className="text-xs t-muted label-xs">Score moy.</p>
                <p className={`text-sm font-bold ${scoreColor(avgScore)}`}>{Math.round(avgScore)}/100</p>
              </div>
              <div className="elevated rounded-lg p-2 text-center">
                <p className="text-xs t-muted label-xs">Rdt. moy.</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {avgYield > 0 ? fmt.pct(avgYield) : '—'}
                </p>
              </div>
              <div className="elevated rounded-lg p-2 text-center">
                <p className="text-xs t-muted label-xs">Régions</p>
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{regions.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Center :Meilleures régions */}
        <div className="card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold t-primary flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              Meilleures régions
            </h2>
            <button
              onClick={() => navigate('/regions')}
              className="btn-ghost text-xs flex items-center gap-1"
            >
              Toutes <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 px-3 mb-1.5">
            <span className="w-5" />
            <span className="flex-1 label-xs t-muted">Région</span>
            <span className="label-xs t-muted hidden sm:block w-14 text-right">Rdt</span>
            <span className="label-xs t-muted hidden md:block w-20 text-right">Prix/m²</span>
            <span className="label-xs t-muted w-10 text-right">Score</span>
          </div>

          <div className="flex-1 space-y-0.5 overflow-y-auto">
            {sortedRegions.slice(0, 6).map((region, idx) => (
              <RegionRow key={region.slug} rank={idx + 1} region={region} />
            ))}
            {sortedRegions.length === 0 && (
              <p className="t-muted text-xs text-center py-8">Aucune région disponible</p>
            )}
          </div>
        </div>

        {/* Right :Classements rapides */}
        <div className="card p-5 flex flex-col gap-3">
          <h2 className="text-sm font-semibold t-primary flex items-center gap-2">
            <Target className="w-4 h-4 text-violet-500" />
            Classements :accès direct
          </h2>
          {[
            { path: '/rankings/global',           label: 'Top investissement équilibré', desc: 'Meilleures opportunités France', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/20' },
            { path: '/rankings/yield',             label: 'Top rendement réaliste',       desc: 'Rendement 4–10%, données fiables', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
            { path: '/rankings/low-risk',          label: 'Top faible risque',             desc: 'riskLevel=LOW · marché stable',    color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-950/20' },
            { path: '/rankings/beginner',          label: 'Top villes débutants',          desc: 'Accessible, lisible, sécurisé',     color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/20' },
            { path: '/rankings/price-accessible',  label: 'Prix accessibles',              desc: '< 2 000 €/m² · fort cashflow',     color: 'text-rose-600',   bg: 'bg-rose-50 dark:bg-rose-950/20' },
            { path: '/rankings/yield-traps',       label: 'Yield traps potentiels',        desc: '⚠️ À analyser avant d\'investir',  color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-950/20' },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full text-left px-3 py-2.5 rounded-xl ${item.bg} border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group`}
            >
              <p className={`text-xs font-semibold ${item.color} group-hover:underline`}>{item.label}</p>
              <p className="text-[11px] t-muted mt-0.5">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3 :Top classements nationaux (4 cols)                             */}
      {/* ------------------------------------------------------------------ */}

      <div>
        <h2 className="text-base font-semibold t-primary mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-500" />
          Classements nationaux
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MiniRankTable
            title="Investissement équilibré"
            icon={<Star className="w-4 h-4 text-amber-500" />}
            cities={rankGlobal}
            scoreGetter={(c) => n(c.globalScore)}
            rankingType="global"
            loading={false}
          />
          <MiniRankTable
            title="Villes débutants"
            icon={<Zap className="w-4 h-4 text-emerald-500" />}
            cities={rankCashflow}
            scoreGetter={(c) => n(c.beginnerScore)}
            rankingType="beginner"
            loading={false}
          />
          <MiniRankTable
            title="Rendement réaliste"
            icon={<TrendingUp className="w-4 h-4 text-blue-500" />}
            cities={rankYield}
            scoreGetter={(c) => n(c.yieldScore)}
            rankingType="yield"
            loading={false}
          />
          <MiniRankTable
            title="Top patrimonial"
            icon={<Shield className="w-4 h-4 text-violet-500" />}
            cities={rankPatrimonial}
            scoreGetter={(c) => n(c.patrimonialScore)}
            rankingType="patrimonial"
            loading={false}
          />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 4 :Insights nationaux automatiques                                */}
      {/* ------------------------------------------------------------------ */}

      {insights.length > 0 && (
        <div>
          <h2 className="text-base font-semibold t-primary mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Insights nationaux
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className="card card-hover flex-shrink-0 w-64 sm:w-72 p-4 flex flex-col gap-2"
              >
                <div className="p-1.5 rounded-lg elevated w-fit">{insight.icon}</div>
                <p className="text-xs t-secondary leading-relaxed">{insight.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 5 :CTA section                                                    */}
      {/* ------------------------------------------------------------------ */}

      <div>
        <h2 className="text-base font-semibold t-primary mb-3">
          Explorer le marché
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <button
            onClick={() => navigate('/regions')}
            className="card card-hover p-5 flex flex-col gap-3 text-left group"
          >
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 w-fit">
              <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold t-primary mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Explorer par région
              </h3>
              <p className="text-xs t-muted leading-relaxed">
                Comparez les {regions.length} régions françaises par score, rendement et prix.
                Identifiez les zones les plus attractives.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium mt-auto">
              Voir les régions <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => navigate('/explorer')}
            className="card card-hover p-5 flex flex-col gap-3 text-left group"
          >
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 w-fit">
              <Search className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold t-primary mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Recherche avancée
              </h3>
              <p className="text-xs t-muted leading-relaxed">
                Filtrez les {fmt.num(totalCommunes)} communes par rendement, prix, score,
                profil investisseur et niveau de risque.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-auto">
              Ouvrir l'explorateur <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => navigate('/compare')}
            className="card card-hover p-5 flex flex-col gap-3 text-left group"
          >
            <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/30 w-fit">
              <GitCompare className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold t-primary mb-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                Comparer des villes
              </h3>
              <p className="text-xs t-muted leading-relaxed">
                Mettez en regard jusqu'à 4 communes : scores, prix, rendements
                et profils d'investissement côte à côte.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 font-medium mt-auto">
              Comparer <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Quick links strip */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <span className="text-xs t-muted font-medium">Accès rapide :</span>
        {[
          { label: 'Départements', path: '/departments' },
          { label: 'Investissement équilibré', path: '/rankings/global' },
          { label: 'Villes débutants', path: '/rankings/beginner' },
          { label: 'Rendement réaliste', path: '/rankings/yield' },
          { label: 'Carte interactive', path: '/map' },
          { label: 'Méthodologie', path: '/methodology' },
        ].map(({ label, path }) => (
          <Link
            key={path}
            to={path}
            className="text-xs btn-ghost py-1 px-2.5 rounded-lg"
          >
            {label}
          </Link>
        ))}
      </div>

    </div>
  );
}
