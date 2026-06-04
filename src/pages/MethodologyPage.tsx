import { Shield, TrendingUp, Train, BarChart2, AlertTriangle } from 'lucide-react';

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-slate-800 text-blue-400">{icon}</div>
        <h3 className="font-bold text-slate-100">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ScoreRow({ label, weight, description }: { label: string; weight: string; description: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-800 last:border-0">
      <div className="w-24 shrink-0">
        <span className="text-xs font-bold text-slate-300">{label}</span>
        <span className="ml-2 text-[10px] text-blue-400 font-mono">{weight}</span>
      </div>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  );
}

export function MethodologyPage() {
  return (
    <div className="p-6 space-y-4 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-lg font-black text-slate-100 mb-1">Méthodologie</h2>
        <p className="text-sm text-slate-500">Comment sont calculés les scores et profils</p>
      </div>

      <Section icon={<BarChart2 size={16} />} title="Score Global (0-100)">
        <p className="text-sm text-slate-400 mb-4 leading-relaxed">
          Le score global agrège plusieurs dimensions pour produire un indicateur synthétique de l'opportunité d'investissement.
        </p>
        <ScoreRow label="Rendement" weight="30%" description="Rendement brut de l'appartement et de la maison, normalisé sur l'ensemble du dataset." />
        <ScoreRow label="Risque" weight="25%" description="Inverse du score de risque (vacance, isolement, fragilité socio-éco). Plus le risque est faible, plus le score monte." />
        <ScoreRow label="Transport" weight="15%" description="Accessibilité en transport : gares proches, type RER/Train/Métro, score d'investissement transport." />
        <ScoreRow label="Socio-éco" weight="15%" description="Revenu médian, densité, score de marché locatif — indicateurs de solvabilité et de demande locative." />
        <ScoreRow label="Croissance" weight="15%" description="Croissance de la population sur 6 ans — indicateur de dynamisme territorial." />
      </Section>

      <Section icon={<AlertTriangle size={16} />} title="Profils d'investissement">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: 'CASHFLOW_OPPORTUNITY', label: 'Cashflow', color: 'emerald', desc: 'Fort rendement brut (>7%) avec vacance maîtrisée et demande locative soutenue.' },
            { name: 'BEGINNER_FRIENDLY', label: 'Débutant', color: 'blue', desc: 'Risque faible/modéré, marché liquide, rendement raisonnable, commune accessible.' },
            { name: 'PATRIMONIAL_SAFE', label: 'Patrimonial', color: 'violet', desc: 'Valorisation long terme, revenu élevé, risque très faible, position défensive.' },
            { name: 'LONG_TERM_POTENTIAL', label: 'Long terme', color: 'cyan', desc: 'Croissance de population, développement territorial, potentiel de plus-value.' },
            { name: 'BALANCED_OPPORTUNITY', label: 'Équilibré', color: 'teal', desc: 'Bon compromis rendement/sécurité/transport, sans excès dans un sens ou l\'autre.' },
            { name: 'YIELD_TRAP', label: 'Piège rendement', color: 'red', desc: 'Rendement élevé sur le papier MAIS vacance très élevée, isolation ou fragilité économique.' },
            { name: 'LOW_INTEREST', label: 'Faible intérêt', color: 'slate', desc: 'Aucun avantage particulier : rendement faible, prix élevé et risque non compensé.' },
          ].map((p) => (
            <div key={p.name} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full bg-${p.color}-500`} />
                <span className={`text-xs font-bold text-${p.color}-400`}>{p.label}</span>
                <code className="text-[9px] text-slate-600 font-mono ml-auto">{p.name}</code>
              </div>
              <p className="text-xs text-slate-400">{p.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<Shield size={16} />} title="Niveaux de risque">
        <div className="space-y-2">
          {[
            { level: 'LOW', color: 'emerald', desc: 'Vacance < 5%, marché dynamique, revenu élevé, aucun facteur dégradant.' },
            { level: 'MODERATE', color: 'amber', desc: 'Quelques signaux à surveiller mais aucun facteur rédhibitoire.' },
            { level: 'HIGH', color: 'orange', desc: 'Vacance significative, isolement partiel ou dégradation socio-économique.' },
            { level: 'VERY_HIGH', color: 'red', desc: 'Plusieurs facteurs de risque cumulés : vacance élevée + isolement + revenu faible.' },
          ].map((r) => (
            <div key={r.level} className="flex items-start gap-3 bg-slate-800 rounded-lg p-3 border border-slate-700">
              <span className={`text-xs font-bold text-${r.color}-400 w-20 shrink-0 mt-0.5`}>{r.level}</span>
              <p className="text-xs text-slate-400">{r.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<Train size={16} />} title="Score transport">
        <p className="text-sm text-slate-400 leading-relaxed">
          Basé sur la distance à la gare la plus proche, le nombre de gares dans un rayon de 5 km et le type de liaison (RER &gt; Train &gt; Métro &gt; Tram). Une commune ISOLATED n'a aucune gare à moins de 10 km et ne dispose d'aucun autre mode lourd.
        </p>
      </Section>

      <Section icon={<TrendingUp size={16} />} title="Sources des données">
        <div className="space-y-2 text-xs text-slate-400">
          <p><strong className="text-slate-300">Prix immobiliers :</strong> MeilleursAgents — prix au m², loyers, rendements bruts.</p>
          <p><strong className="text-slate-300">Population & revenus :</strong> INSEE RP2020 (recensement), FILOSOFI 2020 (revenus fiscaux).</p>
          <p><strong className="text-slate-300">Transport :</strong> Dataset national des gares SNCF/RATP avec géolocalisation.</p>
          <p><strong className="text-slate-300">Vacance :</strong> INSEE RP2020, catégories de logements (résidences secondaires / vacants).</p>
          <p className="text-slate-500 mt-3 italic">Les données ne sont pas mises à jour en temps réel. Les rendements doivent être vérifiés avant tout investissement.</p>
        </div>
      </Section>
    </div>
  );
}
