import React, {
  Suspense,
  lazy,
  useEffect,
  useState,
  memo,
} from 'react';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';

import { AppProviders, useAuth } from './providers';

import { Loader } from './components/common/Loader';
import { NotificationContainer } from './components/common/Notification';
import { ParticleBackground } from './components/common/ParticleBackground';
import { CyberGrid } from './components/common/CyberGrid';
import { Scanline } from './components/common/Scanline';

import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { StatusBar } from './components/layout/StatusBar';

import { useUIStore } from './store/uiStore';
import { useNotificationStore } from './store/notificationStore';

import { ROUTES } from './constants/routes';
import { APP_CONFIG, IS_DEV, IS_PROD, FEATURE_FLAGS } from './constants/config';
import LazyRoute from './routes/LazyRoute';

const SearchDashboard = lazy(() => import('./components/search/SearchDashboard'));
const AnalyticsDashboard = lazy(() =>
  import('./components/analytics/AnalyticsDashboard').then((m) => ({
    default: m.AnalyticsDashboard,
  }))
);
const MorphingGrid = lazy(() =>
  import('./components/search/MorphingGrid').then((m) => ({
    default: m.MorphingGrid,
  }))
);

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ErrorPage = lazy(() => import('./pages/ErrorPage'));
const Home = lazy(() => import('./pages/Home'));

const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: true,
        retry: (failureCount, error: any) => {
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            return false;
          }
          if (error?.response?.status === 404) {
            return false;
          }
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        networkMode: 'online',
        structuralSharing: true,
      },
      mutations: {
        retry: 1,
        networkMode: 'online',
        onError: (error: any) => {
          if (IS_DEV) {
            console.error('🔴 Mutation error:', error);
          }
        },
      },
    },
  });

const queryClient = createQueryClient();
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader fullScreen text="Verifying session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader fullScreen text="Loading..." />;
  }

  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || ROUTES.HOME;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <Loader fullScreen text="Verifying privileges..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!user?.role || !['admin', 'super_admin'].includes(user.role)) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
};

const PageTransition: React.FC<{ children: React.ReactNode }> = memo(({ children }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{
          duration: 0.25,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="flex-1"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
});

PageTransition.displayName = 'PageTransition';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return null;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { sidebarOpen, particlesEnabled, scanlinesEnabled, backgroundEffects } = useUIStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setIsMobileMenuOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-x-hidden">
      {backgroundEffects && particlesEnabled && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <ParticleBackground />
        </div>
      )}

      {backgroundEffects && (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]">
          <CyberGrid animated speed={0.3} />
        </div>
      )}

      {scanlinesEnabled && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Scanline
            speed={0.5}
            color="#06b6d4"
            intensity={0.3}
            animated
          />
        </div>
      )}

      <Header
        user={user}
        isScrolled={isScrolled}
        onMenuToggle={() => setIsMobileMenuOpen((prev) => !prev)}
        onLogout={logout}
      />

      <div className="relative z-10 flex flex-1">
        <Sidebar
          isOpen={sidebarOpen}
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
          user={user}
        />

        <main
          className="flex-1 min-w-0 transition-all duration-300"
          style={{
            marginLeft: sidebarOpen ? '280px' : '80px',
          }}
        >
          <div className="h-full">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>

      <StatusBar />
    </div>
  );
};

const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<Loader fullScreen text="Loading module..." />}>
      <Routes>
        <Route
          path={ROUTES.HOME}
          element={
            <PublicRoute>
              <LazyRoute>
                <PageTransition>
                  <Home />
                </PageTransition>
              </LazyRoute>
            </PublicRoute>
          }
        />

        <Route
          path={ROUTES.DASHBOARD}
          element={
            <PublicRoute>
              <AppLayout>
                <LazyRoute>
                  <PageTransition>
                    <SearchDashboard />
                  </PageTransition>
                </LazyRoute>
              </AppLayout>
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.LOGIN}
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.REGISTER}
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        <Route
          path={ROUTES.HOME}
          element={
            <ProtectedRoute>
              <AppLayout>
                <SearchDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.SEARCH}
          element={
            <ProtectedRoute>
              <AppLayout>
                <SearchDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.ANALYTICS}
          element={
            <ProtectedRoute>
              <AppLayout>
                <AnalyticsDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/compare"
          element={
            <ProtectedRoute>
              <AppLayout>
                <MorphingGrid results={[]} />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {FEATURE_FLAGS.enableAdminPanel && (
          <Route
            path={ROUTES.ADMIN}
            element={
              <AdminRoute>
                <AppLayout>
                  <div className="p-8">
                    <h1 className="text-2xl font-bold font-mono text-cyan-400">ADMIN CONTROL MATRIX</h1>
                    <p className="text-sm text-gray-400 font-mono mt-2">Administrative oversight module active.</p>
                  </div>
                </AppLayout>
              </AdminRoute>
            }
          />
        )}

        {/* ═══ ERROR & FALLBACK ROUTES ═══ */}
        <Route path="/error" element={<ErrorPage />} />
        <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

const SystemMonitor: React.FC = () => {
  const addNotification = useNotificationStore((s) => s.add);

  useEffect(() => {
    const handleOnline = () => {
      addNotification({
        type: 'success',
        message: 'Connection restored',
        priority: 'normal',
        dismissible: true,
      });
    };

    const handleOffline = () => {
      addNotification({
        type: 'warning',
        message: 'You are offline. Some features may be limited.',
        priority: 'high',
        dismissible: true,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addNotification]);

  return null;
};

const ThemeEffectManager: React.FC = () => {
  const { theme, isDark, accentColor, fontScale, reducedMotion } = useUIStore();

  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove('light', 'dark', 'cyberpunk', 'matrix');
    root.classList.add(isDark ? 'dark' : 'light');

    if (theme === 'cyberpunk') root.classList.add('cyberpunk');
    if (theme === 'matrix') root.classList.add('matrix');

    root.style.setProperty('--accent-color', accentColor);
    root.style.fontSize = `${fontScale * 16}px`;

    if (reducedMotion) {
      root.style.setProperty('--motion-duration', '0.01s');
    } else {
      root.style.removeProperty('--motion-duration');
    }
  }, [theme, isDark, accentColor, fontScale, reducedMotion]);

  return null;
};

const AppContent: React.FC = () => {
  const queryClientInstance = useQueryClient();

  useEffect(() => {
    const unsubscribe = queryClientInstance.getQueryCache().subscribe((event) => {
      if (event.type === 'updated' && event.query.state.status === 'error') {
        if (IS_DEV) {
          console.error('Query error:', event.query.state.error);
        }
      }
    });

    return () => unsubscribe();
  }, [queryClientInstance]);

  return (
    <>
      <ThemeEffectManager />
      <SystemMonitor />
      <ScrollToTop />

      <AppRouter />

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(10, 10, 15, 0.95)',
            color: '#ffffff',
            border: '1px solid rgba(34, 211, 238, 0.2)',
            borderRadius: '12px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 20px rgba(34, 211, 238, 0.05)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '13px',
          },
          success: {
            icon: '🚀',
            style: {
              border: '1px solid rgba(74, 222, 128, 0.3)',
              background: 'rgba(10, 20, 15, 0.95)',
            },
          },
          error: {
            icon: '💀',
            style: {
              border: '1px solid rgba(248, 113, 113, 0.3)',
              background: 'rgba(20, 10, 15, 0.95)',
            },
          },
          loading: {
            icon: '⚡',
            style: {
              border: '1px solid rgba(250, 204, 21, 0.3)',
              background: 'rgba(20, 18, 10, 0.95)',
            },
          },
        }}
      />

      <NotificationContainer />
    </>
  );
};

const GlobalErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  useEffect(() => {
    if (IS_PROD && (window as any).Sentry) {
      (window as any).Sentry.captureException(error);
    }
    console.error('🔴 Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-black to-gray-950">
      <div className="max-w-2xl w-full">
        <div className="relative bg-red-900/10 backdrop-blur-2xl border border-red-500/30 rounded-3xl p-8 shadow-2xl shadow-red-500/10 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-purple-500 to-red-500 animate-pulse" />

          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center flex-shrink-0 border border-red-500/30">
              <span className="text-4xl">⚡</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-red-400 mb-1">
                System Alert
              </h2>
              <p className="text-gray-400 text-sm">
                The application encountered a critical error
              </p>
            </div>
          </div>

          <div className="bg-black/50 rounded-xl p-4 mb-6 font-mono text-xs text-red-300 overflow-auto max-h-40 border border-red-500/10">
            <div className="text-red-500 font-bold mb-1">ERROR:</div>
            {errorMessage}
            {IS_DEV && errorStack && (
              <>
                <div className="text-red-500 font-bold mt-4 mb-1">STACK:</div>
                <pre className="whitespace-pre-wrap">{errorStack}</pre>
              </>
            )}
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={resetErrorBoundary}
              className="flex-1 min-w-[140px] px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl font-semibold transition-all shadow-lg shadow-red-500/25 text-white"
            >
              🔄 Try Again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex-1 min-w-[140px] px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold transition-all border border-white/10 text-white"
            >
              ↻ Reload Page
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = ROUTES.HOME)}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold transition-all border border-white/10 text-white"
            >
              🏠 Home
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-red-500/10 flex items-center justify-between text-[10px] text-gray-600 font-mono">
            <span>Chronos Search v{APP_CONFIG.version}</span>
            <span>{new Date().toISOString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const BootstrapGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        if (document.fonts) {
          await document.fonts.ready;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
        setIsReady(true);
      } catch (error) {
        console.error('Bootstrap failed:', error);
        setIsReady(true);
      }
    };

    bootstrap();
  }, []);

  if (!isReady) {
    return <Loader fullScreen text="Initializing Chronos Engine..." />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('🔴 Window error:', event.error);
      if (IS_PROD && (window as any).Sentry) {
        (window as any).Sentry.captureException(event.error);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🔴 Unhandled rejection:', event.reason);
      if (IS_PROD && (window as any).Sentry) {
        (window as any).Sentry.captureException(event.reason);
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ErrorBoundary
      FallbackComponent={GlobalErrorFallback}
      onReset={() => {
        queryClient.clear();
      }}
    >
      <AppProviders queryClient={queryClient}>
        <BootstrapGuard>
          <AppContent />
        </BootstrapGuard>
      </AppProviders>
    </ErrorBoundary>
  );
};

export default App;