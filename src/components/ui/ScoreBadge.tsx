interface Props { score: number | null | undefined; label?: string; size?: 'sm' | 'md' | 'lg'; }

function getColors(score: number) {
  if (score >= 70) return { text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-950', border: 'border-emerald-300 dark:border-emerald-900' };
  if (score >= 50) return { text: 'text-blue-700 dark:text-blue-400',   bg: 'bg-blue-100 dark:bg-blue-950',   border: 'border-blue-300 dark:border-blue-900' };
  if (score >= 30) return { text: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-950', border: 'border-amber-300 dark:border-amber-900' };
  return           { text: 'text-red-700 dark:text-red-400',   bg: 'bg-red-100 dark:bg-red-950',   border: 'border-red-300 dark:border-red-900' };
}

export function ScoreBadge({ score, label, size = 'md' }: Props) {
  if (score == null || isNaN(score)) return <span className="t-muted text-xs">—</span>;
  const s = Math.round(score);
  const { text, bg, border } = getColors(s);

  if (size === 'lg') {
    return (
      <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl border ${bg} ${border}`}>
        <span className={`text-2xl font-black ${text}`}>{s}</span>
        {label && <span className="text-[9px] text-slate-500 uppercase tracking-wide">{label}</span>}
      </div>
    );
  }
  if (size === 'sm') {
    return <span className={`inline-flex items-center border rounded-full text-[10px] font-bold px-1.5 py-0.5 ${bg} ${border} ${text}`}>{s}</span>;
  }
  return (
    <span className={`inline-flex items-center border rounded-full text-xs font-bold px-2 py-0.5 ${bg} ${border} ${text}`}>
      {s}{label && <span className="ml-1 font-normal text-slate-500">{label}</span>}
    </span>
  );
}

interface ScoreRingProps { score: number | null | undefined; label: string; size?: number; }

export function ScoreRing({ score, label, size = 56 }: ScoreRingProps) {
  const s = score != null && !isNaN(score) ? Math.round(score) : null;
  const { text, bg, border } = s != null ? getColors(s) : { text: 'text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', border: 'border-slate-200 dark:border-slate-700' };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`flex items-center justify-center rounded-full border-2 font-black ${text} ${bg} ${border}`}
        style={{ width: size, height: size, fontSize: size * 0.35 }}
      >
        {s ?? '—'}
      </div>
      <span className="text-[10px] t-muted text-center leading-tight">{label}</span>
    </div>
  );
}
