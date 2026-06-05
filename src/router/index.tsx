import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Params = Record<string, string>;

interface RouterContextValue {
  pathname: string;
  params: Params;
  navigate: (path: string) => void;
}

interface OutletContextValue {
  element: React.ReactNode | null;
}

// ---------------------------------------------------------------------------
// Contexts
// ---------------------------------------------------------------------------

const RouterContext = createContext<RouterContextValue>({
  pathname: '/',
  params: {},
  navigate: () => undefined,
});

const OutletContext = createContext<OutletContextValue>({ element: null });

// ---------------------------------------------------------------------------
// matchRoute
// ---------------------------------------------------------------------------

/**
 * Match a route pattern against a pathname.
 * Supports dynamic segments like :slug, :code, :inseeCode, :type.
 * Returns a params object on match, null on no match.
 */
export function matchRoute(pattern: string, pathname: string): Params | null {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = pathname.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params: Params = {};

  for (let i = 0; i < patternParts.length; i++) {
    const patternSegment = patternParts[i];
    const pathSegment = pathParts[i];

    if (patternSegment.startsWith(':')) {
      const key = patternSegment.slice(1);
      params[key] = decodeURIComponent(pathSegment);
    } else if (patternSegment !== pathSegment) {
      return null;
    }
  }

  return params;
}

// ---------------------------------------------------------------------------
// RouterProvider
// ---------------------------------------------------------------------------

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [pathname, setPathname] = useState<string>(
    () => window.location.pathname
  );

  const navigate = useCallback((path: string) => {
    window.history.pushState(null, '', path);
    // Store only the pathname — strip query string and hash so route matching works
    setPathname(path.split('?')[0].split('#')[0]);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // params are resolved by the Routes component and injected via a
  // separate provider wrapping the matched subtree. At the top level we
  // expose an empty params object; routes override it through context.
  const value: RouterContextValue = {
    pathname,
    params: {},
    navigate,
  };

  return (
    <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useNavigate(): (path: string) => void {
  const { navigate } = useContext(RouterContext);
  return navigate;
}

export function useParams(): Params {
  const { params } = useContext(RouterContext);
  return params;
}

export function useLocation(): { pathname: string } {
  const { pathname } = useContext(RouterContext);
  return { pathname };
}

// ---------------------------------------------------------------------------
// Route (data holder)
// ---------------------------------------------------------------------------

export interface RouteProps {
  path: string;
  element: React.ReactNode;
  children?: React.ReactNode;
}

export function Route(_props: RouteProps): null {
  return null;
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

interface RouteConfig {
  path: string;
  element: React.ReactNode;
  children: RouteConfig[];
}

function collectRoutes(nodes: React.ReactNode): RouteConfig[] {
  const routes: RouteConfig[] = [];

  React.Children.forEach(nodes, (child) => {
    if (!React.isValidElement(child)) return;

    const props = child.props as RouteProps;
    if (typeof props.path !== 'string') return;

    routes.push({
      path: props.path,
      element: props.element,
      children: props.children ? collectRoutes(props.children) : [],
    });
  });

  return routes;
}

interface MatchResult {
  element: React.ReactNode;
  params: Params;
  outletElement: React.ReactNode | null;
}

function resolveMatch(
  routes: RouteConfig[],
  pathname: string,
  basePath = ''
): MatchResult | null {
  for (const route of routes) {
    const fullPattern = basePath
      ? `${basePath.replace(/\/$/, '')}/${route.path.replace(/^\//, '')}`
      : route.path;

    // Try exact match first (handles leaf routes and exact parent routes)
    const exactParams = matchRoute(fullPattern, pathname);
    if (exactParams !== null) {
      return {
        element: route.element,
        params: exactParams,
        outletElement: null,
      };
    }

    // Try prefix match for nested routes
    if (route.children.length > 0) {
      const childMatch = resolveMatch(route.children, pathname, fullPattern);
      if (childMatch !== null) {
        return {
          element: route.element,
          params: childMatch.params,
          outletElement: childMatch.element,
        };
      }
    }
  }

  return null;
}

export function Routes({ children }: { children?: React.ReactNode }) {
  const { pathname, navigate } = useContext(RouterContext);
  const routes = collectRoutes(children);
  const match = resolveMatch(routes, pathname);

  if (!match) return null;

  const contextValue: RouterContextValue = {
    pathname,
    params: match.params,
    navigate,
  };

  return (
    <RouterContext.Provider value={contextValue}>
      <OutletContext.Provider value={{ element: match.outletElement }}>
        {match.element}
      </OutletContext.Provider>
    </RouterContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Outlet
// ---------------------------------------------------------------------------

export function Outlet() {
  const { element } = useContext(OutletContext);
  return <>{element}</>;
}

// ---------------------------------------------------------------------------
// Link
// ---------------------------------------------------------------------------

export interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  className?: string;
  children?: React.ReactNode;
}

export function Link({ to, children, onClick, ...rest }: LinkProps) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Allow modifier keys to open in new tab / trigger default behaviour
    if (!e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      navigate(to);
    }
    if (onClick) onClick(e);
  };

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
