interface Props {
  score: number | null | undefined;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-400';
  if (score >= 50) return 'text-blue-400';
  if (score >= 30) return 'text-amber-400';
  return 'text-red-400';
}

function getScoreBg(score: number): string {
  if (score >= 70) return 'bg-emerald-950 border-emerald-900';
  if (score >= 50) return 'bg-blue-950 border-blue-900';
  if (score >= 30) return 'bg-amber-950 border-amber-900';
  return 'bg-red-950 border-red-900';
}

export function ScoreBadge({ score, label, size = 'md' }: Props) {
  if (score == null || isNaN(score)) {
    return <span className="text-slate-600 text-xs">—</span>;
  }

  const s = Math.round(score);
  const colorCls = getScoreColor(s);
  const bgCls = getScoreBg(s);

  if (size === 'lg') {
    return (
      <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl border ${bgCls}`}>
        <span className={`text-2xl font-black ${colorCls}`}>{s}</span>
        {label && <span className="text-[9px] text-slate-500 uppercase tracking-wide">{label}</span>}
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center border rounded-full text-[10px] font-bold px-1.5 py-0.5 ${bgCls} ${colorCls}`}>
        {s}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center border rounded-full text-xs font-bold px-2 py-0.5 ${bgCls} ${colorCls}`}>
      {s}{label && <span className="ml-1 font-normal text-slate-500">{label}</span>}
    </span>
  );
}

interface ScoreRingProps {
  score: number | null | undefined;
  label: string;
  size?: number;
}

export function ScoreRing({ score, label, size = 56 }: ScoreRingProps) {
  const s = score != null && !isNaN(score) ? Math.round(score) : 0;
  const colorCls = getScoreColor(s);
  const bgCls = getScoreBg(s);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`flex items-center justify-center rounded-full border-2 font-black ${colorCls} ${bgCls}`}
        style={{ width: size, height: size, fontSize: size * 0.35 }}
      >
        {score != null ? s : '—'}
      </div>
      <span className="text-[10px] text-slate-500 text-center leading-tight">{label}</span>
    </div>
  );
}
