import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { RouterProvider } from './router';

// ---------------------------------------------------------------------------
// Console security — production uniquement
// Désactive les logs pour éviter l'inspection des données API.
// Le vrai anti-scraping reste côté backend (rate limiting, auth tokens).
// ---------------------------------------------------------------------------
if (import.meta.env.PROD) {
  // Avertissement visible avant désactivation
  // eslint-disable-next-line no-console
  console.log(
    '%c⚠ STOP',
    'color:#ef4444;font-size:48px;font-weight:900;',
  );
  // eslint-disable-next-line no-console
  console.log(
    '%cCette console est réservée aux développeurs.\nNe collez aucun code ici — vous pourriez compromettre votre compte.',
    'color:#1e293b;font-size:14px;line-height:1.6;',
  );

  // Silencer tous les canaux console après l'avertissement
  const noop = (): void => {};
  (
    [
      'log', 'debug', 'info', 'warn', 'dir', 'dirxml',
      'table', 'trace', 'group', 'groupCollapsed', 'groupEnd',
      'time', 'timeEnd', 'profile', 'profileEnd', 'count',
    ] as (keyof Console)[]
  ).forEach((m) => {
    (console as unknown as Record<string, unknown>)[m] = noop;
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider>
      <App />
    </RouterProvider>
  </StrictMode>,
);
