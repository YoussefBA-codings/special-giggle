import { useState, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginPage, isAuthenticated } from './pages/LoginPage';
import { Routes, Route } from './router';
import { FranceDashboardPage } from './pages/FranceDashboardPage';
import { RegionsListPage } from './pages/RegionsListPage';
import { RegionPage } from './pages/RegionPage';
import { DepartmentsListPage } from './pages/DepartmentsListPage';
import { DepartmentPage } from './pages/DepartmentPage';
import { CityDetailPage } from './pages/CityDetailPage';
import { AdvancedExplorerPage } from './pages/AdvancedExplorerPage';
import { RankingsPage } from './pages/RankingsPage';
import { MapPage } from './pages/MapPage';
import { ComparePage } from './pages/ComparePage';
import { MethodologyPage } from './pages/MethodologyPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { InvestorProfilesPage } from './pages/InvestorProfilesPage';
import { RiskMapPage } from './pages/RiskMapPage';

const THEME_KEY = 'immoinsight-theme';

function useTheme() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      return next;
    });
  }, []);
  return { isDark, toggle };
}

export default function App() {
  const [authed, setAuthed] = useState(() => isAuthenticated());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isDark, toggle: toggleTheme } = useTheme();

  if (!authed) return <LoginPage onSuccess={() => setAuthed(true)} />;

  return (
    <div className="flex min-h-screen page-bg">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((p) => !p)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto page-bg">
          <Routes>
            <Route path="/" element={<FranceDashboardPage />} />
            <Route path="/regions" element={<RegionsListPage />} />
            <Route path="/regions/:slug" element={<RegionPage />} />
            <Route path="/departments" element={<DepartmentsListPage />} />
            <Route path="/departments/:code" element={<DepartmentPage />} />
            <Route path="/cities/:inseeCode" element={<CityDetailPage />} />
            <Route path="/explorer" element={<AdvancedExplorerPage />} />
            <Route path="/rankings/:type" element={<RankingsPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/opportunities" element={<OpportunitiesPage />} />
            <Route path="/profiles" element={<InvestorProfilesPage />} />
            <Route path="/risk" element={<RiskMapPage />} />
            <Route path="/methodology" element={<MethodologyPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
