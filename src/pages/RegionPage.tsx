import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, AlertTriangle, TrendingUp, Users, Building2, MapPin, Shield, Zap } from 'lucide-react';
import { fetchRegion, fetchDepartments } from '../lib/api';
import type { RegionDetail, DepartmentSummary, CommuneIndex } from '../types/api';
import { fmt } from '../lib/formatters';
import { scoreBg, scoreColor, generateRegionInsights, riskBg } from '../lib/insights';
import { useParams, useNavigate } from '../router';

type Tab = 'top' | 'risks' | 'departments';

function CityRow({ city, rank, metric }: { city: CommuneIndex; rank: number; metric?: 'cashflow'|'yield'|'patrimonial'|'beginner' }) {
  const navigate = useNavigate();
  const score = metric === 'cashflow' ? city.cashflowScore
    : metric === 'yield' ? city.yieldScore
    : metric === 'patrimonial' ? city.patrimonialScore
    : metric === 'beginner' ? city.beginnerScore
    : city.globalScore;
  return (
    <button onClick={() => navigate(`/cities/${city.inseeCode}`)}
      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
      <span className={`text-xs font-bold w-5 shrink-0 ${rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-slate-400' : rank === 3 ? 'text-amber-600' : 't-muted'}`}>{rank}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium t-primary truncate">{city.city}</p>
        <p className="text-[10px] t-muted">{city.departmentName}</p>
      </div>
      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${scoreBg(score)}`}>{score}</span>
      {city.apartmentYield && <span className={`text-xs font-semibold shrink-0 hidden sm:block ${scoreColor(city.apartmentYield * 10)}`}>{fmt.pct(city.apartmentYield, 1)}</span>}
    </button>
  );
}

function TopSection({ title, cities, metric }: { title: string; cities: CommuneIndex[]; metric?: 'cashflow'|'yield'|'patrimonial'|'beginner' }) {
  return (
    <div className="card p-4">
      <h3 className="font-semibold t-primary text-sm mb-3">{title}</h3>
      <div className="space-y-0.5">
        {cities.map((c, i) => <CityRow key={c.inseeCode} city={c} rank={i+1} metric={metric} />)}
        {cities.length === 0 && <p className="text-xs t-muted py-2">Aucune donnée disponible</p>}
      </div>
    </div>
  );
}

export function RegionPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [region, setRegion] = useState<RegionDetail | null>(null);
  const [departments, setDepartments] = useState<DepartmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('top');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([fetchRegion(slug), fetchDepartments()])
      .then(([r, depts]) => {
        setRegion(r);
        setDepartments(depts.filter(d => r.departmentCodes.includes(d.code)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="p-6 space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="card p-5 animate-pulse h-20" />)}
    </div>
  );
  if (!region) return <div className="p-6 t-muted">Région introuvable.</div>;

  const insights = generateRegionInsights(region);

  const KPI_ITEMS = [
    { label: 'Population', value: region.population >= 1e6 ? `${(region.population/1e6).toFixed(1)}M` : `${Math.round(region.population/1e3)}k`, icon: <Users size={16}/>, color: 'text-blue-500' },
    { label: 'Prix moyen m²', value: fmt.eur(region.avgApartmentPrice), icon: <Building2 size={16}/>, color: 'text-purple-500' },
    { label: 'Rendement brut', value: fmt.pct(region.avgApartmentYield, 1), icon: <TrendingUp size={16}/>, color: 'text-emerald-500' },
    { label: 'Score investissement', value: `${region.avgGlobalScore}/100`, icon: <Zap size={16}/>, color: 'text-amber-500' },
    { label: 'Vacance locative', value: fmt.pct(region.avgVacancyRate, 1), icon: <Shield size={16}/>, color: 'text-red-500' },
    { label: 'Revenu médian', value: fmt.income(region.avgMedianIncome), icon: <MapPin size={16}/>, color: 'text-sky-500' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Breadcrumb + back */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/regions')} className="btn-ghost text-xs flex items-center gap-1.5">
          <ArrowLeft size={13}/> Régions
        </button>
        <span className="t-muted text-xs">/</span>
        <span className="text-xs t-primary font-medium">{region.name}</span>
      </div>

      {/* Header */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-black t-primary">{region.name}</h1>
            <p className="text-sm t-muted mt-1">{region.communesCount.toLocaleString('fr-FR')} communes · {region.departmentCodes.length} départements</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${scoreBg(region.avgGlobalScore)}`}>{region.avgGlobalScore}/100</span>
            <button onClick={() => navigate(`/explorer?region=${slug}`)} className="btn-primary text-xs">
              Explorer les communes <ArrowRight size={12} className="inline ml-1"/>
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mt-5">
          {KPI_ITEMS.map((k) => (
            <div key={k.label} className="elevated rounded-xl p-3">
              <div className={`flex items-center gap-1.5 text-xs mb-1.5 ${k.color}`}>{k.icon}<span className="t-muted">{k.label}</span></div>
              <p className="text-base font-bold t-primary">{k.value || '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scores grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { label: 'Global', score: region.avgGlobalScore },
          { label: 'Cashflow', score: region.avgCashflowScore },
          { label: 'Rendement', score: region.avgYieldScore },
          { label: 'Patrimonial', score: region.avgPatrimonialScore },
          { label: 'Débutant', score: region.avgBeginnerScore },
          { label: 'Risque', score: 100 - region.avgRiskScore },
        ].map((s) => (
          <div key={s.label} className="card p-3 text-center">
            <p className="label-xs mb-2">{s.label}</p>
            <p className={`text-lg font-black ${scoreColor(s.score)}`}>{Math.round(s.score)}</p>
            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
              <div className={`h-full rounded-full ${s.score >= 60 ? 'bg-emerald-500' : s.score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${s.score}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {insights.map((ins, i) => (
            <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Zap size={11}/>{ins}
            </span>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          {([['top', 'Top villes'], ['risks', 'Risques'], ['departments', 'Départements']] as [Tab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium transition-colors ${tab === t ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 't-muted hover:t-primary'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="p-4">
          {tab === 'top' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <TopSection title="🏆 Top Investissement" cities={region.topGlobal} />
              <TopSection title="💰 Top Cashflow" cities={region.topCashflow} metric="cashflow" />
              <TopSection title="📈 Top Rendement" cities={region.topYield} metric="yield" />
              <TopSection title="🏛️ Top Patrimonial" cities={region.topPatrimonial} metric="patrimonial" />
              <TopSection title="🎓 Top Débutants" cities={region.topBeginner} metric="beginner" />
              <TopSection title="🛡️ Risque minimal" cities={region.lowRisk} />
            </div>
          )}
          {tab === 'risks' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800 dark:text-amber-400 text-sm">Yield Traps détectées</p>
                  <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">Ces communes affichent un rendement élevé en apparence, mais présentent des signaux de risque cachés (vacance, décroissance, revenu faible).</p>
                </div>
              </div>
              <div className="card p-4">
                <h3 className="font-semibold t-primary text-sm mb-3">⚠️ Yield Traps à éviter</h3>
                <div className="space-y-1">
                  {(region.yieldTraps ?? []).length === 0 && (
                    <p className="text-sm t-muted text-center py-4">Aucune yield trap détectée dans cette région.</p>
                  )}
                  {(region.yieldTraps ?? []).map((c, i) => (
                    <button key={c.inseeCode} onClick={() => navigate(`/cities/${c.inseeCode}`)}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                      <span className="text-xs t-muted w-4 shrink-0">{i+1}</span>
                      <div className="flex-1 min-w-0"><p className="text-sm t-primary font-medium truncate">{c.city}</p></div>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${riskBg(c.riskLevel)}`}>{c.riskLevel}</span>
                      <span className="text-xs text-emerald-600">{fmt.pct(c.apartmentYield, 1)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {tab === 'departments' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {departments.sort((a,b) => b.avgGlobalScore - a.avgGlobalScore).map((d) => (
                <button key={d.code} onClick={() => navigate(`/departments/${d.code}`)}
                  className="card card-hover p-4 text-left flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-sm t-primary shrink-0">{d.code}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold t-primary text-sm truncate">{d.name}</p>
                    <p className="text-xs t-muted">{d.communesCount} communes</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreBg(d.avgGlobalScore)}`}>{d.avgGlobalScore}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
