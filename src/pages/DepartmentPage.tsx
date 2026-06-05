import { useEffect, useState } from 'react';
import { ArrowLeft, AlertTriangle, TrendingUp, Users, Building2, Shield, Zap } from 'lucide-react';
import { fetchDepartment } from '../lib/api';
import type { DepartmentDetail, CommuneIndex } from '../types/api';
import { fmt, n } from '../lib/formatters';
import { scoreBg, scoreColor, riskBg, generateDepartmentInsights } from '../lib/insights';
import { useParams, useNavigate } from '../router';

type Tab = 'top' | 'risks';

function CityRow({ city, rank, metric }: { city: CommuneIndex; rank: number; metric?: string }) {
  const navigate = useNavigate();
  const score = metric === 'cashflow' ? city.cashflowScore : metric === 'yield' ? city.yieldScore
    : metric === 'patrimonial' ? city.patrimonialScore : metric === 'beginner' ? city.beginnerScore : city.globalScore;
  return (
    <button onClick={() => navigate(`/cities/${city.inseeCode}`)}
      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
      <span className={`text-xs font-bold w-5 shrink-0 ${rank===1?'text-yellow-500':rank===2?'text-slate-400':rank===3?'text-amber-600':'t-muted'}`}>{rank}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium t-primary truncate">{city.city}</p>
        <p className="text-[10px] t-muted">{city.postalCode}</p>
      </div>
      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${scoreBg(score)}`}>{score}</span>
      {city.apartmentYield && <span className={`text-xs shrink-0 hidden sm:block ${scoreColor(city.apartmentYield*10)}`}>{fmt.pct(city.apartmentYield,1)}</span>}
    </button>
  );
}

export function DepartmentPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [dept, setDept] = useState<DepartmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('top');

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    fetchDepartment(code).then(setDept).catch(() => {}).finally(() => setLoading(false));
  }, [code]);

  if (loading) return <div className="p-6 space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="card p-5 animate-pulse h-20" />)}</div>;
  if (!dept) return <div className="p-6 t-muted">Département introuvable.</div>;

  const insights = generateDepartmentInsights(dept);
  const KPI = [
    { label: 'Population', value: dept.population >= 1e6 ? `${(dept.population/1e6).toFixed(1)}M` : `${Math.round(dept.population/1e3)}k`, icon: <Users size={16}/> },
    { label: 'Communes', value: dept.communesCount.toString(), icon: <Building2 size={16}/> },
    { label: 'Prix moyen m²', value: fmt.eur(dept.avgApartmentPrice), icon: <Building2 size={16}/> },
    { label: 'Rendement brut', value: fmt.pct(dept.avgApartmentYield, 1), icon: <TrendingUp size={16}/> },
    { label: 'Score investissement', value: `${dept.avgGlobalScore}/100`, icon: <Zap size={16}/> },
    { label: 'Vacance locative', value: fmt.pct(dept.avgVacancyRate, 1), icon: <Shield size={16}/> },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(`/regions/${dept.regionSlug}`)} className="btn-ghost text-xs flex items-center gap-1.5">
          <ArrowLeft size={13}/>{dept.regionName}
        </button>
        <span className="t-muted text-xs">/</span>
        <button onClick={() => navigate('/departments')} className="text-xs t-secondary hover:t-primary">Départements</button>
        <span className="t-muted text-xs">/</span>
        <span className="text-xs t-primary font-medium">{dept.name}</span>
      </div>

      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-lg t-primary shrink-0">{dept.code}</div>
            <div>
              <h1 className="text-2xl font-black t-primary">{dept.name}</h1>
              <p className="text-sm t-muted mt-0.5">
                <button onClick={() => navigate(`/regions/${dept.regionSlug}`)} className="hover:text-blue-600 dark:hover:text-blue-400">{dept.regionName}</button>
                {' · '}{dept.communesCount} communes
              </p>
            </div>
          </div>
          <div className="sm:ml-auto flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${scoreBg(dept.avgGlobalScore)}`}>{dept.avgGlobalScore}/100</span>
            <button onClick={() => navigate(`/explorer?department=${dept.code}`)} className="btn-primary text-xs">Explorer</button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mt-5">
          {KPI.map((k) => (
            <div key={k.label} className="elevated rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs t-muted mb-1.5">{k.icon}<span>{k.label}</span></div>
              <p className="text-base font-bold t-primary">{k.value || '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Score grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { label: 'Global', score: dept.avgGlobalScore },
          { label: 'Cashflow', score: dept.avgCashflowScore },
          { label: 'Rendement', score: dept.avgYieldScore },
          { label: 'Patrimonial', score: dept.avgPatrimonialScore },
          { label: 'Débutant', score: dept.avgBeginnerScore },
          { label: 'Sécurité', score: 100 - dept.avgRiskScore },
        ].map((s) => (
          <div key={s.label} className="card p-3 text-center">
            <p className="label-xs mb-2">{s.label}</p>
            <p className={`text-lg font-black ${scoreColor(s.score)}`}>{Math.round(s.score)}</p>
            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
              <div className={`h-full rounded-full ${s.score>=60?'bg-emerald-500':s.score>=40?'bg-amber-500':'bg-red-500'}`} style={{width:`${s.score}%`}} />
            </div>
          </div>
        ))}
      </div>

      {insights.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {insights.map((ins, i) => (
            <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Zap size={11}/>{ins}
            </span>
          ))}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          {([['top','Top villes'],['risks','Risques']] as [Tab,string][]).map(([t,label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium transition-colors ${tab===t?'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400':'t-muted hover:t-primary'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="p-4">
          {tab === 'top' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[
                { title: '🏆 Top Investissement', cities: dept.topGlobal },
                { title: '💰 Top Cashflow', cities: dept.topCashflow, metric: 'cashflow' },
                { title: '📈 Top Rendement', cities: dept.topYield, metric: 'yield' },
                { title: '🏛️ Top Patrimonial', cities: dept.topPatrimonial, metric: 'patrimonial' },
                { title: '🎓 Top Débutants', cities: dept.topBeginner, metric: 'beginner' },
                { title: '🛡️ Risque minimal', cities: dept.lowRisk },
              ].map(({ title, cities, metric }) => (
                <div key={title} className="card p-4">
                  <h3 className="font-semibold t-primary text-sm mb-3">{title}</h3>
                  <div className="space-y-0.5">
                    {cities.map((c, i) => <CityRow key={c.inseeCode} city={c} rank={i+1} metric={metric} />)}
                    {cities.length === 0 && <p className="text-xs t-muted py-2">Aucune donnée</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === 'risks' && (
            <div className="card p-4">
              <div className="flex items-start gap-3 mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5"/>
                <p className="text-xs text-amber-700 dark:text-amber-400">Rendement apparent élevé mais signaux de risque cachés détectés.</p>
              </div>
              <div className="space-y-1">
                {(dept.yieldTraps ?? []).map((c, i) => (
                  <button key={c.inseeCode} onClick={() => navigate(`/cities/${c.inseeCode}`)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                    <span className="text-xs t-muted w-4 shrink-0">{i+1}</span>
                    <p className="text-sm t-primary flex-1 truncate">{c.city}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${riskBg(c.riskLevel)}`}>{c.riskLevel}</span>
                    <span className="text-xs text-emerald-600">{fmt.pct(c.apartmentYield, 1)}</span>
                  </button>
                ))}
                {(dept.yieldTraps ?? []).length === 0 && <p className="text-xs t-muted py-4 text-center">Aucune yield trap détectée dans ce département.</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
