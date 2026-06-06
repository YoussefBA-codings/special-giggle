import { useState, useEffect } from 'react';
import { Building2, Eye, EyeOff, Lock, User, AlertCircle, TrendingUp } from 'lucide-react';

const CREDENTIALS = { username: 'le_roi_du_m2', password: 'Br1que$D4Or_SansYi3ldTr4p!99' };
const AUTH_KEY = 'immoinsight-auth';

export function isAuthenticated(): boolean {
  return localStorage.getItem(AUTH_KEY) === 'ok';
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.reload();
}

interface Props {
  onSuccess: () => void;
}

export function LoginPage({ onSuccess }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Animate in
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 30); }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate slight delay for UX polish
    setTimeout(() => {
      if (
        username.trim().toLowerCase() === CREDENTIALS.username &&
        password === CREDENTIALS.password
      ) {
        localStorage.setItem(AUTH_KEY, 'ok');
        onSuccess();
      } else {
        setError('Identifiant ou mot de passe incorrect.');
        setLoading(false);
      }
    }, 600);
  }

  return (
    <div className={`min-h-screen flex items-center justify-center page-bg transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm mx-auto px-4">
        {/* Card */}
        <div className="card shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50 overflow-hidden">

          {/* Header strip */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-7 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur mb-4">
              <Building2 size={26} className="text-white" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">ImmoInsight</h1>
            <p className="text-blue-200 text-xs mt-1 font-medium">Analyse immobilière · France entière</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-4">
            <p className="text-sm font-semibold t-primary text-center mb-5">Accès sécurisé</p>

            {/* Username */}
            <div className="space-y-1.5">
              <label className="label-xs block">Identifiant</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 t-muted pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  placeholder="Votre identifiant"
                  autoComplete="username"
                  autoFocus
                  required
                  className="input-base w-full pl-9 py-2.5"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="label-xs block">Mot de passe</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 t-muted pointer-events-none" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="input-base w-full pl-9 pr-10 py-2.5"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 t-muted hover:t-primary transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                <AlertCircle size={13} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="btn-primary w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion…
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 pb-5 flex items-center justify-center gap-1.5">
            <TrendingUp size={11} className="t-muted" />
            <p className="text-[11px] t-muted">34 746 communes · données fiables</p>
          </div>
        </div>
      </div>
    </div>
  );
}
