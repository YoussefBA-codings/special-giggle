import { useEffect, useState, useMemo } from 'react';
import { Trophy, Search, AlertTriangle, Medal, Info, ShieldCheck, TrendingUp, Building2, Star, Eye, MapPin, Percent } from 'lucide-react';
import { fetchCitiesPage, DEFAULT_QUALITY } from '../lib/api';
import type { CommuneIndex } from '../types/api';
import { fmt, n } from '../lib/formatters';
import { scoreBg, scoreColor, riskBg, profileLabel, profileBg } from '../lib/insights';
import { useParams, useNavigate } from '../router';

// ---------------------------------------------------------------------------
// Yield suspicion logic
// ---------------------------------------------------------------------------

function yieldSuspicion(yieldPct: number | null): { level: 'warn' | 'suspect' | 'trap'; label: string } | null {
  if (yieldPct == null) return null;
  if (yieldPct > 12) return { level: 'trap', label: 'Données suspectes' };
  if (yieldPct > 10) return { level: 'suspect', label: 'À analyser' };
  if (yieldPct > 8) return { level: 'warn', label: 'À vérifier' };
  return null;
}

// ---------------------------------------------------------------------------
// Ranking metadata
// ---------------------------------------------------------------------------

type CitiesParamsExtended = Parameters<typeof fetchCitiesPage>[0] & { excludeProfiles?: string[] };

interface RankingMeta {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  primaryMetric: keyof CommuneIndex;
  primaryLabel: string;
  isWarning?: boolean;
  /** Use fetchCitiesPage instead of fetchRanking endpoint */
  useCitiesEndpoint?: boolean;
  citiesParams?: CitiesParamsExtended;
  /** Client-side: exclude yield > 12% AND YIELD_TRAP profiles */
  filterHighYield?: boolean;
}

const RANKING_META: Record<string, RankingMeta> = {
  global: {
    title: 'Top investissement équilibré',
    subtitle: 'Score global · données fiables · yield ≤ 10%',
    description: 'Les meilleures opportunités en France — équilibre rendement, risque, liquidité, fiabilité. Communes profil YIELD_TRAP et rendements aberrants exclus.',
    icon: <Trophy size={16} className="text-yellow-500" />,
    primaryMetric: 'globalScore',
    primaryLabel: 'Score global',
    // Use fetchCitiesPage with strict filters to get clean results
    useCitiesEndpoint: true,
    citiesParams: { minGlobalScore: 50, sortBy: 'globalScore', sortOrder: 'desc', limit: 200,
      excludeProfiles: ['YIELD_TRAP'] },
    filterHighYield: true,
  },
  yield: {
    title: 'Top rendement réaliste',
    subtitle: '4% – 10% · données vérifiées · profil non-trap',
    description: 'Rendements bruts compris entre 4% et 10% avec données fiables. Les rendements > 10% et les profils "yield trap" sont exclus — ils signalent des données erronées ou des marchés non viables.',
    icon: <Percent size={16} className="text-emerald-500" />,
    primaryMetric: 'apartmentYield',
    primaryLabel: 'Rendement brut',
    // fetchCitiesPage with explicit yield range — /rankings/yield is broken
    useCitiesEndpoint: true,
    citiesParams: { minYield: 4, maxYield: 10, minGlobalScore: 40, sortBy: 'apartmentYield',
      sortOrder: 'desc', limit: 200, excludeProfiles: ['YIELD_TRAP'] },
  },
  patrimonial: {
    title: 'Top patrimonial',
    subtitle: 'Valorisation long terme sécurisée',
    description: 'Fort potentiel de valorisation sur 10-15 ans : sécurité du capital, solidité du marché, demande locative durable. Logique de constitution de patrimoine.',
    icon: <Building2 size={16} className="text-purple-500" />,
    primaryMetric: 'patrimonialScore',
    primaryLabel: 'Score patrimonial',
    useCitiesEndpoint: true,
    citiesParams: { minGlobalScore: 45, sortBy: 'patrimonialScore', sortOrder: 'desc', limit: 200, excludeProfiles: ['YIELD_TRAP'] },
    filterHighYield: true,
  },
  beginner: {
    title: 'Top villes débutants',
    subtitle: 'Accessibles, sécurisées, lisibles',
    description: 'Idéales pour un premier investissement : marché stable, risque faible, données fiables. Faciles à analyser, financer et gérer. Ticket d\'entrée raisonnable.',
    icon: <Star size={16} className="text-blue-500" />,
    primaryMetric: 'beginnerScore',
    primaryLabel: 'Score débutant',
    useCitiesEndpoint: true,
    citiesParams: { minGlobalScore: 40, sortBy: 'beginnerScore', sortOrder: 'desc', limit: 200, excludeProfiles: ['YIELD_TRAP'] },
    filterHighYield: true,
  },
  'low-risk': {
    title: 'Top faible risque',
    subtitle: 'riskLevel=LOW · vacance faible · solvabilité forte',
    description: 'Communes les plus sécurisées : risque locatif bas confirmé, faible vacance, solvabilité locataire élevée, marché stable. Le backend /rankings/low-risk étant inversé, ce classement utilise riskLevel=LOW directement.',
    icon: <ShieldCheck size={16} className="text-emerald-500" />,
    primaryMetric: 'globalScore',
    primaryLabel: 'Score global',
    // /rankings/low-risk is BROKEN (returns riskScore=100 = très risqué). Use fetchCitiesPage with riskLevel=LOW
    useCitiesEndpoint: true,
    citiesParams: { riskLevel: 'LOW', minGlobalScore: 40, sortBy: 'globalScore', sortOrder: 'desc', limit: 200 },
    filterHighYield: true,
  },
  'long-term': {
    title: 'Villes à surveiller',
    subtitle: 'Fort potentiel de valorisation',
    description: 'Excellentes perspectives à 10+ ans : croissance démographique, projets d\'infrastructure, dynamisme économique. Investissement de conviction.',
    icon: <Eye size={16} className="text-sky-500" />,
    primaryMetric: 'longTermScore',
    primaryLabel: 'Score long terme',
    useCitiesEndpoint: true,
    citiesParams: { minGlobalScore: 40, sortBy: 'longTermScore', sortOrder: 'desc', limit: 200 },
    filterHighYield: true,
  },
  'yield-traps': {
    title: 'Yield traps potentiels',
    subtitle: '⚠️ Rendement > 10% · données suspectes',
    description: 'Ces communes affichent des rendements > 10% signalant soit des données erronées soit un marché très risqué (vacance élevée, déclin démographique, revenus faibles). Analyse approfondie obligatoire.',
    icon: <AlertTriangle size={16} className="text-amber-500" />,
    primaryMetric: 'apartmentYield',
    primaryLabel: 'Rendement brut',
    isWarning: true,
    useCitiesEndpoint: true,
    citiesParams: { minYield: 10, sortBy: 'apartmentYield', sortOrder: 'desc', limit: 200 },
  },
  'price-accessible': {
    title: 'Prix accessibles',
    subtitle: '< 2 500 €/m² · meilleures communes abordables',
    description: 'Communes avec prix d\'acquisition accessibles et données fiables. Triées par score global puis par prix croissant — les meilleures opportunités avec un faible ticket d\'entrée.',
    icon: <MapPin size={16} className="text-rose-500" />,
    primaryMetric: 'apartmentPrice',
    primaryLabel: 'Prix m²',
    useCitiesEndpoint: true,
    // Le backend ignore minPrice pour les nulls — on filtre/trie côté client après fetch
    citiesParams: { maxPrice: 2500, minGlobalScore: 30, sortBy: 'globalScore', sortOrder: 'desc', limit: 200 },
  },
  'rental-demand': {
    title: 'Forte demande locative',
    subtitle: 'Marché locatif profond et tendu',
    description: 'Demande locative structurellement élevée : forte part de locataires, faible vacance, tension locative confirmée. Risque de vacance quasi nul.',
    icon: <TrendingUp size={16} className="text-violet-500" />,
    primaryMetric: 'rentalDemandScore',
    primaryLabel: 'Score demande',
    useCitiesEndpoint: true,
    citiesParams: { minGlobalScore: 45, sortBy: 'rentalDemandScore', sortOrder: 'desc', limit: 200, excludeProfiles: ['YIELD_TRAP'] },
    filterHighYield: true,
  },
};

const ALL_RANKINGS = [
  { type: 'global',           label: 'Investissement équilibré', icon: <Trophy size={12} /> },
  { type: 'yield',            label: 'Rendement réaliste',        icon: <Percent size={12} /> },
  { type: 'patrimonial',      label: 'Patrimonial',               icon: <Building2 size={12} /> },
  { type: 'beginner',         label: 'Débutants',                  icon: <Star size={12} /> },
  { type: 'low-risk',         label: 'Faible risque',              icon: <ShieldCheck size={12} /> },
  { type: 'long-term',        label: 'À surveiller',               icon: <Eye size={12} /> },
  { type: 'yield-traps',      label: 'Yield traps',                icon: <AlertTriangle size={12} /> },
  { type: 'price-accessible', label: 'Prix accessibles',           icon: <MapPin size={12} /> },
  { type: 'rental-demand',    label: 'Dem. locative',              icon: <TrendingUp size={12} /> },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RankingsPage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const currentType = type ?? 'global';
  const meta = RANKING_META[currentType] ?? RANKING_META.global;

  const [allCommunes, setAllCommunes] = useState<CommuneIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    setSearch('');
    setRegionFilter('');
    setDeptFilter('');

    const loadData = (): Promise<CommuneIndex[]> => {
      if (meta.useCitiesEndpoint && meta.citiesParams) {
        const { excludeProfiles, ...apiParams } = meta.citiesParams;
        return fetchCitiesPage({ ...apiParams, dataQuality: DEFAULT_QUALITY })
          .then((r) => {
            let data = r.data;
            if (excludeProfiles?.length) {
              data = data.filter((c) => !excludeProfiles.includes(c.profile));
            }
            // Pour prix-accessibles : exclure les villes sans prix puis trier par prix croissant
            // (le backend retourne les nulls en premier quand on trie par price asc)
            if (currentType === 'price-accessible') {
              data = data.filter((c) => c.apartmentPrice != null && c.apartmentPrice > 0);
              data = [...data].sort((a, b) => (a.apartmentPrice ?? 99999) - (b.apartmentPrice ?? 99999));
            }
            return data;
          });
      }
      return Promise.resolve([]);
    };

    loadData()
      .then((communes) => {
        let result = communes;
        if (meta.filterHighYield) {
          result = result.filter(
            (c) => (c.apartmentYield ?? 0) <= 12 && c.profile !== 'YIELD_TRAP'
          );
        }
        setAllCommunes(result);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentType]);

  const regions = useMemo(() => [...new Set(allCommunes.map((c) => c.region))].sort(), [allCommunes]);
  const departments = useMemo(() => {
    const base = regionFilter ? allCommunes.filter((c) => c.region === regionFilter) : allCommunes;
    return [...new Set(base.map((c) => c.departmentName))].sort();
  }, [allCommunes, regionFilter]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return allCommunes.filter((c) => {
      if (q) {
        const name = c.city.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        if (!name.includes(q)) return false;
      }
      if (regionFilter && c.region !== regionFilter) return false;
      if (deptFilter && c.departmentName !== deptFilter) return false;
      return true;
    });
  }, [allCommunes, search, regionFilter, deptFilter]);

  const primaryValue = (c: CommuneIndex): string => {
    const m = meta.primaryMetric;
    if (m === 'apartmentYield') return fmt.pct(c.apartmentYield, 1);
    if (m === 'apartmentPrice') return fmt.eur(c.apartmentPrice);
    return `${Math.round(n(c[m] as number))}/100`;
  };

  const rankIcon = (i: number) => {
    if (i === 0) return <Trophy size={13} className="text-yellow-500" />;
    if (i === 1) return <Medal size={13} className="text-slate-400" />;
    if (i === 2) return <Medal size={13} className="text-amber-600" />;
    return <span className="text-[11px] t-muted w-5 text-center inline-block">{i + 1}</span>;
  };

  return (
    <div className="p-4 sm:p-6 flex gap-5 min-h-full">
      {/* Left sidebar */}
      <div className="hidden xl:flex flex-col w-52 shrink-0 gap-0.5">
        <p className="label-xs px-3 mb-2">Classements</p>
        {ALL_RANKINGS.map((r) => {
          const active = currentType === r.type;
          return (
            <button
              key={r.type}
              onClick={() => navigate(`/rankings/${r.type}`)}
              className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                active ? 'bg-blue-600 text-white' : 'btn-ghost'
              }`}
            >
              <span className={active ? 'text-blue-200' : 't-muted'}>{r.icon}</span>
              {r.label}
            </button>
          );
        })}
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="p-2 card rounded-xl shrink-0">{meta.icon}</div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black t-primary">{meta.title}</h1>
              <span className="text-xs t-muted elevated px-2 py-0.5 rounded-full">{meta.subtitle}</span>
            </div>
            <p className="text-sm t-muted mt-0.5 max-w-2xl">{meta.description}</p>
          </div>
        </div>

        {/* Fiabilité info */}
        {!meta.isWarning && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
            <Info size={14} className="text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Données fiables uniquement. Communes avec rendements &gt; 12% ou données incomplètes exclues des classements principaux.
            </p>
          </div>
        )}

        {/* Yield traps warning */}
        {meta.isWarning && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Ces communes semblent rentables en surface mais présentent des signaux d'alerte.{' '}
              <strong>Analyse approfondie obligatoire avant tout investissement.</strong>
            </p>
          </div>
        )}

        {/* Mobile selectors */}
        <div className="xl:hidden flex gap-1.5 overflow-x-auto pb-1">
          {ALL_RANKINGS.map((r) => (
            <button
              key={r.type}
              onClick={() => navigate(`/rankings/${r.type}`)}
              className={`shrink-0 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                currentType === r.type ? 'bg-blue-600 text-white' : 'elevated t-secondary'
              }`}
            >
              {r.icon}
              {r.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 t-muted pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Chercher une ville…"
              className="input-base pl-8 py-1.5 text-xs w-44"
            />
          </div>
          <select
            value={regionFilter}
            onChange={(e) => { setRegionFilter(e.target.value); setDeptFilter(''); }}
            className="select-base text-xs py-1.5"
          >
            <option value="">Toutes les régions</option>
            {regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="select-base text-xs py-1.5"
          >
            <option value="">Tous les dépts</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {(search || regionFilter || deptFilter) && (
            <button
              onClick={() => { setSearch(''); setRegionFilter(''); setDeptFilter(''); }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Réinitialiser
            </button>
          )}
          <span className="text-xs t-muted ml-auto">
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
            {allCommunes.length > filtered.length && <span> (sur {allCommunes.length})</span>}
          </span>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left py-3 px-3 label-xs w-10">#</th>
                  <th className="text-left py-3 px-3 label-xs">Ville</th>
                  <th className="text-left py-3 px-3 label-xs hidden sm:table-cell">Département</th>
                  <th className="text-right py-3 px-3 label-xs text-blue-600 dark:text-blue-400">{meta.primaryLabel}</th>
                  <th className="text-right py-3 px-3 label-xs hidden md:table-cell">Score global</th>
                  <th className="text-right py-3 px-3 label-xs hidden lg:table-cell">Rendement</th>
                  <th className="text-right py-3 px-3 label-xs hidden lg:table-cell">Prix m²</th>
                  <th className="text-right py-3 px-3 label-xs hidden xl:table-cell">Risque</th>
                  <th className="text-left py-3 px-3 label-xs hidden xl:table-cell">Profil</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [...Array(10)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan={9} className="py-3 px-4">
                          <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-full" />
                        </td>
                      </tr>
                    ))
                  : filtered.map((c, i) => {
                      const suspicion = yieldSuspicion(c.apartmentYield);
                      const primaryRaw = n(c[meta.primaryMetric] as number);
                      return (
                        <tr
                          key={c.inseeCode}
                          onClick={() => navigate(`/cities/${c.inseeCode}`)}
                          className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors"
                        >
                          <td className="py-2.5 px-3">
                            <div className="flex items-center justify-center w-5">{rankIcon(i)}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="font-medium t-primary">{c.city}</p>
                            <p className="text-[10px] t-muted sm:hidden">{c.departmentName}</p>
                          </td>
                          <td className="py-2.5 px-3 hidden sm:table-cell">
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(`/departments/${c.department}`); }}
                              className="text-xs t-secondary hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              {c.departmentName}
                            </button>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={`text-sm font-bold ${
                              meta.primaryMetric === 'apartmentPrice'
                                ? 't-primary'
                                : scoreColor(meta.primaryMetric === 'apartmentYield' ? primaryRaw * 10 : primaryRaw)
                            }`}>
                              {primaryValue(c)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right hidden md:table-cell">
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${scoreBg(c.globalScore)}`}>
                              {c.globalScore}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right hidden lg:table-cell">
                            <div className="flex items-center justify-end gap-1.5">
                              <span className={`text-xs font-medium ${scoreColor(n(c.apartmentYield) * 10)}`}>
                                {fmt.pct(c.apartmentYield, 1)}
                              </span>
                              {suspicion && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap ${
                                  suspicion.level === 'trap'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    : suspicion.level === 'suspect'
                                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                }`}>
                                  {suspicion.label}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right hidden lg:table-cell">
                            <span className="text-xs t-secondary">{fmt.eur(c.apartmentPrice)}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right hidden xl:table-cell">
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${riskBg(c.riskLevel)}`}>
                              {c.riskLevel === 'LOW' ? 'Faible' : c.riskLevel === 'MEDIUM' ? 'Moyen' : 'Élevé'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 hidden xl:table-cell">
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${profileBg(c.profile)}`}>
                              {profileLabel(c.profile)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
            {!loading && filtered.length === 0 && (
              <p className="text-center text-sm t-muted py-8">Aucun résultat pour ces critères.</p>
            )}
          </div>
        </div>

        <p className="text-[11px] t-muted text-center">
          Données qualité HIGH · Rendements &gt; 12% exclus des classements principaux · Mise à jour périodique
        </p>
      </div>
    </div>
  );
}
