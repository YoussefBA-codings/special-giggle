import { SearchX } from 'lucide-react';
interface Props { title?: string; description?: string; action?: React.ReactNode; }
export function EmptyState({ title = 'Aucun résultat', description = 'Aucune ville ne correspond à vos filtres.', action }: Props) {
  return (
    <div className="card p-16 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <SearchX size={20} className="t-muted" />
      </div>
      <h3 className="t-primary font-semibold mb-1">{title}</h3>
      <p className="t-secondary text-sm max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
