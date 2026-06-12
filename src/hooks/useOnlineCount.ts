import { useState, useEffect } from 'react';
import { BASE_URL } from '../lib/api';

function getSessionId(): string {
  let id = localStorage.getItem('immoinsight-sid');
  if (!id) {
    id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    localStorage.setItem('immoinsight-sid', id);
  }
  return id;
}

export function useOnlineCount(intervalMs = 30_000): number | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const sid = getSessionId();

    async function ping() {
      try {
        const res = await fetch(`${BASE_URL}/heartbeat?sid=${encodeURIComponent(sid)}`);
        if (res.ok) {
          const data = (await res.json()) as { online?: number };
          setCount(data.online ?? null);
        }
      } catch {
        // endpoint absent — silent fail
      }
    }

    ping();
    const id = setInterval(ping, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return count;
}
