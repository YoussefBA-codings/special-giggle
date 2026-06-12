import { useState, useMemo } from 'react';
import {
  Calculator, Home, Clock, Landmark, AlertTriangle,
  MapPin, Search, Trophy, GitCompare, Lightbulb, Activity,
  ChevronRight, CheckCircle2, TrendingUp, Lock,
} from 'lucide-react';
import { useNavigate } from '../router';
import { isAuthenticated } from './LoginPage';

// ---------------------------------------------------------------------------
// Business logic
// ---------------------------------------------------------------------------

function mensualite(capital: number, tauxAnnuel: number, annees: number): number {
  if (capital <= 0) return 0;
  if (tauxAnnuel === 0) return capital / (annees * 12);
  const r = tauxAnnuel / 100 / 12;
  const n = annees * 12;
  return (capital * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function calcT3Max(
  loyer: number,
  ptz: number,
  t1: number,
  t2: number,
  taux: number,
  duree: number,
): number {
  const mFixed =
    mensualite(ptz, 0, duree) +
    mensualite(t1, 1, duree) +
    mensualite(t2, 2, duree);
  let lo = 0, hi = 5_000_000;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    const assur = ((ptz + t1 + t2 + mid) * 0.003) / 12;
    const tot = mFixed + mensualite(mid, taux, duree) + assur;
    if (tot < loyer) lo = mid; else hi = mid;
  }
  return Math.max(0, (lo + hi) / 2);
}

function eur(v: number, dec = 0): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR',
    maximumFractionDigits: dec, minimumFractionDigits: dec,
  }).format(v);
}

// ---------------------------------------------------------------------------
// Feature catalogue (for CTA section)
// ---------------------------------------------------------------------------

const FEATURES = [
  {
    icon: <Search size={18} />,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-100 dark:bg-violet-900/30',
    title: 'Explorateur avancé',
    desc: '34 746 communes filtrables par rendement, risque, revenu médian, distance gare :trouvez la perle rare.',
  },
  {
    icon: <MapPin size={18} />,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    title: 'Carte interactive',
    desc: '13 filtres en temps réel sur la carte de France : prix, yield, scores, population, risque.',
  },
  {
    icon: <Trophy size={18} />,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    title: 'Classements',
    desc: 'Top villes par stratégie : cashflow, patrimonial, débutant, faible risque. 6 classements distincts.',
  },
  {
    icon: <GitCompare size={18} />,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    title: 'Comparateur',
    desc: 'Jusqu\'à 4 villes côte à côte sur tous les indicateurs : rendement, scores, population, risque.',
  },
  {
    icon: <Lightbulb size={18} />,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    title: 'Opportunités',
    desc: '9 critères croisés pour identifier d\'un coup d\'œil les meilleures opportunités du marché.',
  },
  {
    icon: <Activity size={18} />,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-100 dark:bg-rose-900/30',
    title: 'Carte des risques',
    desc: 'Rendement vs risque : repérez visuellement les zones à éviter et celles à saisir maintenant.',
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StepCard({
  num, icon, title, children,
}: {
  num: number; icon: React.ReactNode; title: string; children: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
          {num}
        </div>
        <span className="t-muted">{icon}</span>
        <h3 className="text-sm font-bold t-primary">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="label-xs block">{label}</label>
      {children}
      {hint && <p className="text-[10px] t-muted">{hint}</p>}
    </div>
  );
}

function EurInput({ value, onChange, placeholder = '0' }: { value: number; onChange: (v: number) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <input
        type="number"
        inputMode="numeric"
        min={0}
        step={1000}
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
        onWheel={(e) => e.currentTarget.blur()}
        className="input-base w-full text-sm pr-8"
      />
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs t-muted pointer-events-none">€</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function SimulateurRentabilitePage({ onLogin }: { onLogin?: () => void }) {
  const navigate = useNavigate();
  const authed = isAuthenticated();

  // Step 1
  const [surface, setSurface] = useState(50);
  const [prixM2, setPrixM2] = useState(12);

  // Step 2
  const [duree, setDuree] = useState<20 | 25 | 30>(25);

  // Step 3
  const [ptz, setPtz] = useState(0);
  const [t1, setT1] = useState(0);
  const [t2, setT2] = useState(0);
  const [taux, setTaux] = useState(3.5);

  const loyer = useMemo(() => surface * prixM2, [surface, prixM2]);
  const t3 = useMemo(() => calcT3Max(loyer, ptz, t1, t2, taux, duree), [loyer, ptz, t1, t2, taux, duree]);

  const capitalTotal = ptz + t1 + t2 + t3;
  const mPtz = mensualite(ptz, 0, duree);
  const mT1 = mensualite(t1, 1, duree);
  const mT2 = mensualite(t2, 2, duree);
  const mT3 = mensualite(t3, taux, duree);
  const assurance = (capitalTotal * 0.003) / 12;
  const echeanceTotal = mPtz + mT1 + mT2 + mT3 + assurance;
  const t3IsZero = t3 <= 1;

  const tranches = [
    { label: 'PTZ', rate: '0 %', capital: ptz, mens: mPtz },
    { label: 'Action Logement', rate: '1 %', capital: t1, mens: mT1 },
    { label: 'Effort banque', rate: '2 %', capital: t2, mens: mT2 },
    { label: 'Crédit normal', rate: `${taux.toFixed(1)} %`, capital: t3, mens: mT3, calculated: true },
  ];

  function handleCta() {
    if (authed) { navigate('/explorer'); return; }
    if (onLogin) onLogin();
  }

  return (
    <div className="page-bg min-h-full">

      {/* ================================================================== */}
      {/* HERO                                                                */}
      {/* ================================================================== */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-4xl mx-auto px-5 py-14 sm:py-20 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur mb-6">
            <Calculator size={28} className="text-white" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-4">
            Simulateur de rentabilité locative
          </h1>
          <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Calculez instantanément le <strong className="text-white">budget maximum d'acquisition</strong> pour
            qu'un bien immobilier s'autofinance grâce au loyer :sans apport, à l'euro près.
          </p>

          {/* Pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {['100 % gratuit', 'Sans inscription', 'Résultat instantané', 'Autofinancement complet'].map((pill) => (
              <span key={pill} className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                <CheckCircle2 size={12} />
                {pill}
              </span>
            ))}
          </div>

          {/* How it works */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
            {[
              { n: '①', title: 'Définissez le loyer', body: 'Superficie et prix au m² :le loyer cible est calculé automatiquement.' },
              { n: '②', title: 'Choisissez la durée', body: 'Crédit sur 20, 25 ou 30 ans selon votre stratégie patrimoniale.' },
              { n: '③', title: 'Structurez le financement', body: 'PTZ, Action Logement, effort bancaire :l\'algorithme trouve le crédit max pour équilibrer loyer = échéance.' },
            ].map((s) => (
              <div key={s.n} className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-2xl mb-2">{s.n}</div>
                <p className="text-sm font-bold text-white mb-1">{s.title}</p>
                <p className="text-xs text-blue-200 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* METHOD NOTE                                                         */}
      {/* ================================================================== */}
      <section className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-5 py-4 flex flex-wrap justify-center gap-6">
          {[
            { icon: <TrendingUp size={13} />, text: 'Basé sur l\'autofinancement complet (loyer = échéance)' },
            { icon: <Calculator size={13} />, text: 'Algorithme de bisection :80 itérations, précision maximale' },
            { icon: <CheckCircle2 size={13} />, text: 'Assurance emprunteur incluse (0,30 % / an)' },
          ].map((m) => (
            <div key={m.text} className="flex items-center gap-2 text-xs t-muted">
              <span className="text-blue-500">{m.icon}</span>
              {m.text}
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================== */}
      {/* CALCULATOR                                                          */}
      {/* ================================================================== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-lg font-black t-primary mb-6 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-blue-600 inline-block" />
          Votre simulation
        </h2>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* Left :3 étapes */}
          <div className="xl:col-span-2 space-y-4">

            {/* Étape 1 */}
            <StepCard num={1} icon={<Home size={14} />} title="Bien &amp; location">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Field label="Superficie (m²)">
                  <input
                    type="number"
                    inputMode="numeric"
                    step={1}
                    value={surface || ''}
                    placeholder="50"
                    onChange={(e) => setSurface(parseFloat(e.target.value) || 0)}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="input-base w-full text-sm"
                  />
                </Field>
                <Field label="Prix de location (€ / m² / mois)">
                  <input
                    type="number"
                    inputMode="decimal"
                    step={0.5}
                    value={prixM2 || ''}
                    placeholder="12"
                    onChange={(e) => setPrixM2(parseFloat(e.target.value) || 0)}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="input-base w-full text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </Field>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <p className="text-xs t-muted mb-1">Loyer mensuel estimé</p>
                <p className="text-2xl font-black text-blue-700 dark:text-blue-300">
                  {eur(loyer)}{' '}
                  <span className="text-sm font-normal t-muted">/ mois</span>
                </p>
                <p className="text-[11px] t-muted mt-1">{surface} m² × {eur(prixM2, 2)} / m²</p>
              </div>
            </StepCard>

            {/* Étape 2 */}
            <StepCard num={2} icon={<Clock size={14} />} title="Durée du crédit">
              <div className="flex gap-3">
                {([20, 25, 30] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuree(d)}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                      duree === d
                        ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900'
                        : 'border-slate-200 dark:border-slate-700 t-secondary hover:border-blue-400 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20'
                    }`}
                  >
                    {d} ans
                  </button>
                ))}
              </div>
            </StepCard>

            {/* Étape 3 */}
            <StepCard num={3} icon={<Landmark size={14} />} title="Financement">
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="PTZ :0 %" hint="Prêt à taux zéro">
                    <EurInput value={ptz} onChange={setPtz} />
                  </Field>
                  <Field label="Action Logement :1 %">
                    <EurInput value={t1} onChange={setT1} />
                  </Field>
                  <Field label="Effort banque :2 %">
                    <EurInput value={t2} onChange={setT2} />
                  </Field>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label-xs">Taux crédit normal</label>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                      {taux.toFixed(1)} %
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1} max={7} step={0.1}
                    value={taux}
                    onChange={(e) => setTaux(parseFloat(e.target.value))}
                    className="w-full accent-blue-500 h-2 cursor-pointer"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] t-muted">1 %</span>
                    <span className="text-[10px] t-muted">7 %</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Crédit normal</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold uppercase tracking-wide">calculé</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{taux.toFixed(1)} %</span>
                  </div>
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{eur(t3)}</p>
                  <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1.5">
                    Montant max pour que loyer = échéance totale
                  </p>
                </div>
              </div>
            </StepCard>
          </div>

          {/* Right :Résultats */}
          <div className="xl:col-span-1 space-y-4 xl:sticky xl:top-4 xl:self-start">

            <div className="card p-5 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-transparent">
              <p className="text-[11px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-2">
                Prix max du bien
              </p>
              <p className="text-3xl font-black text-blue-700 dark:text-blue-300 leading-none">{eur(capitalTotal)}</p>
              <p className="text-[11px] t-muted mt-2">PTZ + T1 + T2 + Crédit normal</p>
              {capitalTotal > 0 && surface > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                  <p className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-1">
                    Prix m² à ne pas dépasser
                  </p>
                  <p className="text-xl font-black text-blue-600 dark:text-blue-300">
                    {eur(capitalTotal / surface)}
                    <span className="text-sm font-normal t-muted"> / m²</span>
                  </p>
                </div>
              )}
            </div>

            {t3IsZero && (
              <div className="flex gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Les tranches existantes dépassent déjà le loyer, aucune marge pour le crédit normal.
                </p>
              </div>
            )}

            <div className="space-y-2">
              {[
                { label: 'Loyer mensuel', value: eur(loyer), sub: null, highlight: false },
                {
                  label: 'Échéance totale',
                  value: eur(echeanceTotal),
                  sub: Math.abs(echeanceTotal - loyer) < 2 ? '= loyer ✓' : null,
                  highlight: Math.abs(echeanceTotal - loyer) < 2,
                },
                { label: 'dont assurance', value: eur(assurance), sub: '0,30 % capital / an ÷ 12', highlight: false },
              ].map((m) => (
                <div key={m.label} className="elevated rounded-xl p-3">
                  <p className="label-xs mb-1">{m.label}</p>
                  <p className={`text-lg font-black ${m.highlight ? 'text-emerald-600 dark:text-emerald-400' : 't-primary'}`}>
                    {m.value}
                  </p>
                  {m.sub && (
                    <p className={`text-[10px] mt-0.5 ${m.highlight ? 'text-emerald-500' : 't-muted'}`}>{m.sub}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="card overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold t-primary">Détail des tranches</p>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {tranches.map((tr) => (
                  <div key={tr.label} className={`px-4 py-2.5 ${tr.calculated ? 'bg-emerald-50/60 dark:bg-emerald-950/10' : ''}`}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-medium t-primary">{tr.label}</span>
                      <span className="text-[10px] t-muted">{tr.rate}</span>
                      {tr.calculated && (
                        <span className="px-1 py-px rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold">calculé</span>
                      )}
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="t-muted">{eur(tr.capital)}</span>
                      <span className="font-semibold t-primary tabular-nums">{eur(tr.mens)} /mois</span>
                    </div>
                  </div>
                ))}
                <div className="px-4 py-2.5 bg-slate-50/50 dark:bg-slate-800/20">
                  <div className="flex justify-between text-xs">
                    <span className="t-muted">Assurance emprunteur</span>
                    <span className="font-semibold t-primary tabular-nums">{eur(assurance)} /mois</span>
                  </div>
                </div>
                <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold t-primary">Total mensuel</span>
                    <span className="text-sm font-black t-primary tabular-nums">{eur(echeanceTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CTA :découvrir la plateforme                                       */}
      {/* ================================================================== */}
      {(!authed || onLogin) && (
        <section className="border-t border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="max-w-5xl mx-auto px-5 py-14 sm:py-16">

            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                <Lock size={12} />
                Accès complet sur demande
              </div>
              <h2 className="text-2xl sm:text-3xl font-black t-primary mb-3">
                Le simulateur n'est que la&nbsp;surface.
              </h2>
              <p className="text-base t-secondary max-w-xl mx-auto leading-relaxed">
                Simulateur Locatif analyse <strong className="t-primary">34 746 communes françaises</strong> avec des
                indicateurs propriétaires pour identifier les opportunités que les autres outils ne voient pas.
              </p>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {FEATURES.map((f) => (
                <div key={f.title} className="card p-4 flex gap-3 items-start hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <div className={`w-9 h-9 rounded-xl ${f.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <span className={f.color}>{f.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold t-primary mb-1">{f.title}</p>
                    <p className="text-xs t-muted leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA button */}
            <div className="text-center">
              <button
                onClick={handleCta}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-950 transition-all hover:scale-[1.02] active:scale-100"
              >
                Accéder à la plateforme complète
                <ChevronRight size={16} />
              </button>
              <p className="text-xs t-muted mt-3">Accès sur invitation :données France entière</p>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
