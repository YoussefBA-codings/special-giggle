import { useEffect, useState } from 'react';
import type { CommuneIndex } from '../types/api';
import { fetchCitiesPage, DEFAULT_QUALITY } from '../lib/api';
import { n } from '../lib/formatters';
import { OpportunitySection } from '../components/opportunities/OpportunitySection';
import { Loader2 } from 'lucide-react';
import { useNavigate } from '../router';

interface Props { onCityClick?: (inseeCode: string) => void; }

type CitiesParamsExtended = Parameters<typeof fetchCitiesPage>[0] & { excludeProfiles?: string[] };

interface RankingSection {
  title: string;
  subtitle: string;
  emoji: string;
  key: string;
  params: CitiesParamsExtended;
  filterHighYield?: boolean;
  getter: (c: CommuneIndex) => number;
}

const SECTIONS: RankingSection[] = [
  {
    title: 'Top ·Score global',
    subtitle: 'Meilleures communes toutes stratégies',
    emoji: '🌟',
    key: 'global',
    params: { minGlobalScore: 50, sortBy: 'globalScore', sortOrder: 'desc', limit: 30, excludeProfiles: ['YIELD_TRAP'] },
    filterHighYield: true,
    getter: (c) => n(c.globalScore),
  },
  {
    title: 'Top ·Cashflow',
    subtitle: 'Fort cashflow locatif',
    emoji: '💰',
    key: 'cashflow',
    params: { minGlobalScore: 40, sortBy: 'cashflowScore', sortOrder: 'desc', limit: 30, excludeProfiles: ['YIELD_TRAP'] },
    filterHighYield: true,
    getter: (c) => n(c.cashflowScore),
  },
  {
    title: 'Top ·Débutants',
    subtitle: 'Profil rassurant pour premier invest.',
    emoji: '🎯',
    key: 'beginner',
    params: { minGlobalScore: 40, sortBy: 'beginnerScore', sortOrder: 'desc', limit: 30, excludeProfiles: ['YIELD_TRAP'] },
    filterHighYield: true,
    getter: (c) => n(c.beginnerScore),
  },
  {
    title: 'Top ·Patrimonial',
    subtitle: 'Sécurité et valorisation long terme',
    emoji: '🏛️',
    key: 'patrimonial',
    params: { minGlobalScore: 45, sortBy: 'patrimonialScore', sortOrder: 'desc', limit: 30, excludeProfiles: ['YIELD_TRAP'] },
    filterHighYield: true,
    getter: (c) => n(c.patrimonialScore),
  },
  {
    title: 'Top ·Long terme',
    subtitle: 'Potentiel de valorisation élevé',
    emoji: '📈',
    key: 'long-term',
    params: { minGlobalScore: 40, sortBy: 'longTermScore', sortOrder: 'desc', limit: 30 },
    filterHighYield: true,
    getter: (c) => n(c.longTermScore),
  },
  {
    title: 'Top ·Rendement réaliste',
    subtitle: '4–10% · données vérifiées · non-trap',
    emoji: '⚡',
    key: 'yield',
    params: { minYield: 4, maxYield: 10, minGlobalScore: 40, sortBy: 'apartmentYield', sortOrder: 'desc', limit: 30, excludeProfiles: ['YIELD_TRAP'] },
    getter: (c) => n(c.yieldScore),
  },
  {
    title: 'Top ·Demande locative',
    subtitle: 'Marché locatif le plus tendu',
    emoji: '🏠',
    key: 'rental-demand',
    params: { minGlobalScore: 45, sortBy: 'rentalDemandScore', sortOrder: 'desc', limit: 30, excludeProfiles: ['YIELD_TRAP'] },
    filterHighYield: true,
    getter: (c) => n(c.rentalDemandScore),
  },
  {
    title: 'Top ·Faible risque',
    subtitle: 'Communes les moins risquées',
    emoji: '🛡️',
    key: 'low-risk',
    params: { riskLevel: 'LOW', minGlobalScore: 40, sortBy: 'globalScore', sortOrder: 'desc', limit: 30 },
    filterHighYield: true,
    getter: (c) => n(c.globalScore),
  },
  {
    title: '⚠️ Pièges rendement',
    subtitle: 'Rendement apparent élevé mais risque caché',
    emoji: '🪤',
    key: 'yield-traps',
    params: { minYield: 10, sortBy: 'apartmentYield', sortOrder: 'desc', limit: 30 },
    getter: (c) => n(c.yieldScore),
  },
];

export function OpportunitiesPage({ onCityClick }: Props) {
  const navigate = useNavigate();
  const handleCityClick = onCityClick ?? ((id: string) => navigate(`/cities/${id}`));
  const [rankings, setRankings] = useState<Record<string, CommuneIndex[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all(
      SECTIONS.map((s) => {
        const { excludeProfiles, ...apiParams } = s.params;
        return fetchCitiesPage({ ...apiParams, dataQuality: DEFAULT_QUALITY })
          .then((r) => {
            let data = r.data;
            if (excludeProfiles?.length) {
              data = data.filter((c) => !excludeProfiles!.includes(c.profile));
            }
            if (s.filterHighYield) {
              data = data.filter((c) => (c.apartmentYield ?? 0) <= 12 && c.profile !== 'YIELD_TRAP');
            }
            return [s.key, data] as const;
          });
      })
    )
      .then((results) => {
        const map: Record<string, CommuneIndex[]> = {};
        results.forEach(([key, communes]) => { map[key] = communes; });
        setRankings(map);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin t-muted" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-3">
      <div className="mb-4">
        <h2 className="text-lg font-black t-primary">Opportunités</h2>
        <p className="text-sm t-secondary mt-1">Cliquez sur une section pour la déployer</p>
      </div>
      {SECTIONS.map((s, i) => (
        <OpportunitySection
          key={s.key}
          title={s.title}
          subtitle={s.subtitle}
          emoji={s.emoji}
          cities={rankings[s.key] ?? []}
          scoreGetter={s.getter}
          onCityClick={handleCityClick}
          defaultExpanded={i === 0}
          maxVisible={6}
        />
      ))}
    </div>
  );
}
