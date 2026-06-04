import { Shield, TrendingUp, Train, BarChart2, AlertTriangle } from 'lucide-react';

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400">{icon}</div>
        <h3 className="font-bold t-primary">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ScoreRow({ label, weight, description }: { label: string; weight: string; description: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="w-24 shrink-0">
        <span className="text-xs font-bold t-primary">{label}</span>
        <span className="ml-2 text-[10px] text-blue-600 dark:text-blue-400 font-mono">{weight}</span>
      </div>
      <p className="text-xs t-secondary">{description}</p>
    </div>
  );
}

export function MethodologyPage() {
  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-4xl">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg font-black t-primary mb-1">Méthodologie</h2>
        <p className="text-sm t-muted">Comment sont calculés les scores et profils</p>
      </div>

      <Section icon={<BarChart2 size={16} />} title="Score Global (0-100)">
        <p className="text-sm t-secondary mb-4 leading-relaxed">Le score global agrège plusieurs dimensions pour produire un indicateur synthétique.</p>
        <ScoreRow label="Rendement"  weight="30%" description="Rendement brut normalisé sur l'ensemble du dataset." />
        <ScoreRow label="Risque"     weight="25%" description="Inverse du score de risque (vacance, isolement, fragilité socio-éco)." />
        <ScoreRow label="Transport"  weight="15%" description="Accessibilité : gares proches, type RER/Train/Métro, score d'investissement transport." />
        <ScoreRow label="Socio-éco"  weight="15%" description="Revenu médian disponible, densité, score de marché locatif." />
        <ScoreRow label="Croissance" weight="15%" description="Croissance de la population sur 6 ans — dynamisme territorial." />
      </Section>

      <Section icon={<AlertTriangle size={16} />} title="Profils d'investissement">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: 'CASHFLOW_OPPORTUNITY', label: 'Cashflow', cls: 'text-emerald-700 dark:text-emerald-400', desc: 'Fort rendement brut (>7%) avec vacance maîtrisée et demande locative soutenue.' },
            { name: 'BEGINNER_FRIENDLY',    label: 'Débutant',   cls: 'text-blue-700 dark:text-blue-400',    desc: 'Risque faible/modéré, marché liquide, rendement raisonnable.' },
            { name: 'PATRIMONIAL_SAFE',     label: 'Patrimonial',cls: 'text-violet-700 dark:text-violet-400',desc: 'Valorisation long terme, revenu élevé, risque très faible.' },
            { name: 'LONG_TERM_POTENTIAL',  label: 'Long terme', cls: 'text-cyan-700 dark:text-cyan-400',   desc: 'Croissance de population, développement territorial, potentiel de plus-value.' },
            { name: 'BALANCED_OPPORTUNITY', label: 'Équilibré',  cls: 'text-teal-700 dark:text-teal-400',  desc: 'Bon compromis rendement/sécurité/transport.' },
            { name: 'YIELD_TRAP',           label: 'Piège',      cls: 'text-red-700 dark:text-red-400',     desc: 'Rendement élevé sur le papier mais vacance très élevée ou isolement.' },
            { name: 'LOW_INTEREST',         label: 'Faible',     cls: 'text-slate-500',                     desc: 'Aucun avantage particulier : rendement faible, prix élevé.' },
          ].map((p) => (
            <div key={p.name} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold ${p.cls}`}>{p.label}</span>
                <code className="text-[9px] t-muted font-mono ml-auto">{p.name}</code>
              </div>
              <p className="text-xs t-secondary">{p.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<Shield size={16} />} title="Niveaux de risque">
        <div className="space-y-2">
          {[
            { level: 'LOW',       cls: 'text-emerald-700 dark:text-emerald-400', desc: 'Vacance < 5%, marché dynamique, revenu élevé.' },
            { level: 'MODERATE',  cls: 'text-amber-700 dark:text-amber-400',    desc: 'Quelques signaux à surveiller mais aucun facteur rédhibitoire.' },
            { level: 'HIGH',      cls: 'text-orange-700 dark:text-orange-400',  desc: 'Vacance significative, isolement partiel ou dégradation socio-économique.' },
            { level: 'VERY_HIGH', cls: 'text-red-700 dark:text-red-400',        desc: 'Plusieurs facteurs de risque cumulés : vacance élevée + isolement + revenu faible.' },
          ].map((r) => (
            <div key={r.level} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
              <span className={`text-xs font-bold w-20 shrink-0 mt-0.5 ${r.cls}`}>{r.level}</span>
              <p className="text-xs t-secondary">{r.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<Train size={16} />} title="Score transport">
        <p className="text-sm t-secondary leading-relaxed">
          Basé sur la distance à la gare la plus proche, le nombre de gares dans un rayon de 5 km et le type de liaison (RER &gt; Train &gt; Métro &gt; Tram). Une commune ISOLATED n'a aucune gare à moins de 10 km.
        </p>
      </Section>

      <Section icon={<TrendingUp size={16} />} title="Sources des données">
        <div className="space-y-2 text-xs t-secondary">
          <p><strong className="t-primary">Prix immobiliers :</strong> MeilleursAgents — prix au m², loyers, rendements bruts.</p>
          <p><strong className="t-primary">Population & revenus :</strong> INSEE RP2020, FILOSOFI 2020 (<em>revenu disponible net</em> après impôts et prestations sociales).</p>
          <p><strong className="t-primary">Transport :</strong> Dataset national des gares SNCF/RATP géolocalisées.</p>
          <p><strong className="t-primary">Vacance :</strong> INSEE RP2020, catégories de logements vacants.</p>
          <p className="t-muted italic mt-3">Les données ne sont pas mises à jour en temps réel. Les rendements doivent être vérifiés avant tout investissement.</p>
        </div>
      </Section>
    </div>
  );
}
