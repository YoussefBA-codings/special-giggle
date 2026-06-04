import { useState } from 'react';
import { RotateCcw, ChevronDown, ChevronUp, Download, SlidersHorizontal } from 'lucide-react';
import type { Filters } from '../../types/filters';
import { DEFAULT_FILTERS, FILTER_PRESETS } from '../../types/filters';
import { hasActiveFilters } from '../../lib/filters';

interface Props {
  filters: Filters; departments: string[]; allTags: string[];
  resultCount: number; onChange: (f: Filters) => void; onReset: () => void; onExport: () => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-xs block mb-1">{label}</label>
      {children}
    </div>
  );
}

const PROFILES = [
  { value: '', label: 'Tous profils' },
  { value: 'CASHFLOW_OPPORTUNITY', label: 'Cashflow' },
  { value: 'BEGINNER_FRIENDLY', label: 'Débutant' },
  { value: 'PATRIMONIAL_SAFE', label: 'Patrimonial' },
  { value: 'LONG_TERM_POTENTIAL', label: 'Long terme' },
  { value: 'BALANCED_OPPORTUNITY', label: 'Équilibré' },
  { value: 'YIELD_TRAP', label: 'Piège rendement' },
  { value: 'LOW_INTEREST', label: 'Faible intérêt' },
];
const RISKS = [
  { value: '', label: 'Tous risques' },
  { value: 'LOW', label: 'Faible' }, { value: 'MODERATE', label: 'Modéré' },
  { value: 'HIGH', label: 'Élevé' }, { value: 'VERY_HIGH', label: 'Très élevé' },
];
const RECOS = [
  { value: '', label: 'Toutes recommandations' },
  { value: 'STRONG_OPPORTUNITY', label: 'Forte opportunité' },
  { value: 'GOOD_TO_ANALYZE', label: 'À analyser' },
  { value: 'ONLY_EXPERIENCED', label: 'Expérimenté uniquement' },
  { value: 'AVOID_FOR_BEGINNER', label: 'Éviter si débutant' },
  { value: 'AVOID', label: 'À éviter' },
];
const TRANSPORT_CLASSES = [
  { value: '', label: 'Toutes classifications' },
  { value: 'EXCELLENT', label: 'Excellent' }, { value: 'GOOD', label: 'Bon' },
  { value: 'MODERATE', label: 'Moyen' }, { value: 'LOW', label: 'Faible' }, { value: 'ISOLATED', label: 'Isolée' },
];

export function FiltersPanel({ filters, departments, allTags, resultCount, onChange, onReset, onExport }: Props) {
  const [open, setOpen] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const active = hasActiveFilters(filters);

  function set<K extends keyof Filters>(key: K, value: Filters[K]) { onChange({ ...filters, [key]: value }); }

  function applyPreset(presetId: string) {
    const preset = FILTER_PRESETS.find((p) => p.id === presetId);
    if (preset) onChange({ ...DEFAULT_FILTERS, ...preset.filters });
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2">
        <button onClick={() => setOpen((p) => !p)} className="flex items-center gap-2 t-secondary hover:t-primary transition-colors">
          <SlidersHorizontal size={14} />
          <span className="text-sm font-semibold">Filtres</span>
          {active && <span className="w-2 h-2 rounded-full bg-blue-500" />}
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs t-muted">{resultCount} résultat{resultCount > 1 ? 's' : ''}</span>
          {active && (
            <button onClick={onReset} className="btn-ghost text-xs flex items-center gap-1 py-1">
              <RotateCcw size={11} /> Réinitialiser
            </button>
          )}
          <button onClick={onExport} className="btn-primary text-xs flex items-center gap-1 py-1.5 px-3">
            <Download size={11} /> CSV
          </button>
        </div>
      </div>

      {open && (
        <div className="p-4 space-y-4">
          {/* Presets */}
          <div>
            <p className="label-xs mb-2">Presets rapides</p>
            <div className="flex flex-wrap gap-1.5">
              {FILTER_PRESETS.map((preset) => (
                <button key={preset.id} onClick={() => applyPreset(preset.id)} title={preset.description}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-300 t-secondary text-xs transition-colors">
                  <span>{preset.icon}</span><span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Field label="Recherche">
              <input type="text" placeholder="Ville, tag, profil…" value={filters.search}
                onChange={(e) => set('search', e.target.value)} className="input-base w-full" />
            </Field>
            <Field label="Département">
              <select value={filters.department} onChange={(e) => set('department', e.target.value)} className="input-base w-full">
                <option value="">Tous</option>
                {departments.map((d) => <option key={d} value={d}>Dép. {d}</option>)}
              </select>
            </Field>
            <Field label="Profil investissement">
              <select value={filters.profile} onChange={(e) => set('profile', e.target.value as Filters['profile'])} className="input-base w-full">
                {PROFILES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </Field>
            <Field label="Niveau de risque">
              <select value={filters.riskLevel} onChange={(e) => set('riskLevel', e.target.value as Filters['riskLevel'])} className="input-base w-full">
                {RISKS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </Field>
          </div>

          {/* Numeric row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Field label="Rendement min (%)">
              <input type="number" placeholder="Ex: 6" value={filters.minYield || ''} min={0} max={25} step={0.5} onChange={(e) => set('minYield', parseFloat(e.target.value) || 0)} className="input-base w-full" />
            </Field>
            <Field label="Prix max (€/m²)">
              <input type="number" placeholder="Ex: 4000" value={filters.maxPrice || ''} min={0} step={100} onChange={(e) => set('maxPrice', parseFloat(e.target.value) || 0)} className="input-base w-full" />
            </Field>
            <Field label="Vacance max (%)">
              <input type="number" placeholder="Ex: 8" value={filters.maxVacancy || ''} min={0} max={50} step={0.5} onChange={(e) => set('maxVacancy', parseFloat(e.target.value) || 0)} className="input-base w-full" />
            </Field>
            <Field label="Gare max (km)">
              <input type="number" placeholder="Ex: 5" value={filters.maxStationDistance || ''} min={0} step={1} onChange={(e) => set('maxStationDistance', parseFloat(e.target.value) || 0)} className="input-base w-full" />
            </Field>
            <Field label="Score global min">
              <input type="number" placeholder="Ex: 50" value={filters.minGlobalScore || ''} min={0} max={100} onChange={(e) => set('minGlobalScore', parseFloat(e.target.value) || 0)} className="input-base w-full" />
            </Field>
            <Field label="Revenu min (€)">
              <input type="number" placeholder="Ex: 25000" value={filters.minIncome || ''} min={0} step={1000} onChange={(e) => set('minIncome', parseFloat(e.target.value) || 0)} className="input-base w-full" />
            </Field>
          </div>

          <button onClick={() => setAdvancedOpen((p) => !p)} className="flex items-center gap-1 text-xs t-muted hover:t-secondary transition-colors">
            {advancedOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            Filtres avancés
          </button>

          {advancedOpen && (
            <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <Field label="Recommandation">
                  <select value={filters.recommendation} onChange={(e) => set('recommendation', e.target.value as Filters['recommendation'])} className="input-base w-full">
                    {RECOS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </Field>
                <Field label="Transport">
                  <select value={filters.transportClassification} onChange={(e) => set('transportClassification', e.target.value as Filters['transportClassification'])} className="input-base w-full">
                    {TRANSPORT_CLASSES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </Field>
                <Field label="Bien recommandé">
                  <select value={filters.bestPropertyType} onChange={(e) => set('bestPropertyType', e.target.value as Filters['bestPropertyType'])} className="input-base w-full">
                    <option value="">Tous</option>
                    <option value="apartment">Appartement</option>
                    <option value="house">Maison</option>
                  </select>
                </Field>
                <Field label="Score cashflow min">
                  <input type="number" placeholder="Ex: 50" value={filters.minCashflowScore || ''} min={0} max={100} onChange={(e) => set('minCashflowScore', parseFloat(e.target.value) || 0)} className="input-base w-full" />
                </Field>
                <Field label="Score débutant min">
                  <input type="number" placeholder="Ex: 50" value={filters.minBeginnerScore || ''} min={0} max={100} onChange={(e) => set('minBeginnerScore', parseFloat(e.target.value) || 0)} className="input-base w-full" />
                </Field>
              </div>
              <div className="flex flex-wrap gap-4">
                {([
                  { key: 'excludeYieldTrap' as const, label: 'Exclure pièges rendement' },
                  { key: 'excludeIsolated' as const, label: 'Exclure communes isolées' },
                  { key: 'beginnerOnly' as const, label: 'Débutant uniquement' },
                  { key: 'cashflowOnly' as const, label: 'Cashflow uniquement' },
                ]).map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={filters[key]} onChange={(e) => set(key, e.target.checked)} className="w-3.5 h-3.5 rounded accent-blue-500" />
                    <span className="text-xs t-secondary">{label}</span>
                  </label>
                ))}
              </div>
              {allTags.length > 0 && (
                <Field label="Filtrer par tags">
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {allTags.slice(0, 20).map((tag) => {
                      const isActive = filters.selectedTags.includes(tag);
                      return (
                        <button key={tag}
                          onClick={() => set('selectedTags', isActive ? filters.selectedTags.filter((t) => t !== tag) : [...filters.selectedTags, tag])}
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${isActive ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700' : 'bg-slate-100 dark:bg-slate-800 t-muted border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'}`}>
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
