interface LineProps {
  className?: string;
}

interface CardProps {
  className?: string;
}

interface TableProps {
  rows?: number;
}

/**
 * A single animated skeleton line — use for text placeholders.
 */
export function SkeletonLine({ className = '' }: LineProps) {
  return (
    <div
      className={`h-3 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse ${className}`}
    />
  );
}

/**
 * A block-level skeleton card — use for card / image / chart placeholders.
 */
export function SkeletonCard({ className = '' }: CardProps) {
  return (
    <div
      className={`w-full rounded-xl bg-slate-100 dark:bg-slate-800/70 animate-pulse ${className}`}
    />
  );
}

/**
 * A skeleton that mimics a data table with a header row and body rows.
 */
export function SkeletonTable({ rows = 5 }: TableProps) {
  return (
    <div className="w-full space-y-0 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
        <SkeletonLine className="w-1/4 h-2.5" />
        <SkeletonLine className="w-1/6 h-2.5" />
        <SkeletonLine className="w-1/6 h-2.5" />
        <SkeletonLine className="w-1/6 h-2.5" />
        <SkeletonLine className="w-1/6 h-2.5 ml-auto" />
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 bg-white dark:bg-slate-900"
        >
          <SkeletonLine className={`w-1/4 h-2.5 ${i % 2 === 0 ? 'opacity-70' : 'opacity-100'}`} />
          <SkeletonLine className={`w-1/6 h-2.5 ${i % 3 === 0 ? 'opacity-60' : 'opacity-90'}`} />
          <SkeletonLine className="w-1/6 h-2.5 opacity-75" />
          <SkeletonLine className="w-1/6 h-2.5 opacity-80" />
          <SkeletonLine className="w-1/6 h-2.5 ml-auto opacity-70" />
        </div>
      ))}
    </div>
  );
}
