import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { AdminRoute } from './AdminRoute';
import { PremiumRoute } from './PremiumRoute';
import { LazyRoute } from './LazyRoute';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { StatusBar } from '../components/layout/StatusBar';
import { Loader } from '../components/common/Loader';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

import { ROUTES } from '../constants/routes';

const SearchDashboard = lazy(() => import('../components/search/SearchDashboard'));
const AnalyticsDashboard = lazy(() => import('../components/analytics/AnalyticsDashboard'));
const MorphingGrid = lazy(() => import('../components/search/MorphingGrid'));

const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const ErrorPage = lazy(() => import('../pages/ErrorPage'));

interface AppShellProps {
    children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
    return (
        <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden">
            <Header />

            <div className="relative z-10 flex flex-1">
                <Sidebar />
                <main className="flex-1 lg:ml-64 transition-all duration-300 ease-in-out">
                    <ErrorBoundary>
                        <Suspense fallback={<Loader />}>
                            {children}
                        </Suspense>
                    </ErrorBoundary>
                </main>
            </div>

            <StatusBar />
        </div>
    );
};

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            {children}
        </motion.div>
    );
};

export const AppRoutes: React.FC = () => {
    const location = useLocation();
    useEffect(() => {
        const path = location.pathname;
        const titles: Record<string, string> = {
            [ROUTES.HOME]: 'Dashboard',
            [ROUTES.LOGIN]: 'Login',
            [ROUTES.REGISTER]: 'Register',
            [ROUTES.ANALYTICS]: 'Analytics',
            [ROUTES.HISTORY]: 'History',
            [ROUTES.PROFILE("default")]: 'Profile',
            [ROUTES.FEEDBACK]: 'Feedback',
            [ROUTES.SETTINGS]: 'Settings',
            [ROUTES.ADMIN]: 'Admin',
        };
        const pageTitle = titles[path] || 'Page';
        document.title = `${pageTitle} | ChromaSearch`;
    }, [location.pathname]);

    return (
        <Suspense fallback={<Loader fullScreen text="Loading module..." />}>
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route
                        path={ROUTES.LOGIN}
                        element={
                            <PublicRoute>
                                <LazyRoute>
                                    <PageTransition>
                                        <LoginPage />
                                    </PageTransition>
                                </LazyRoute>
                            </PublicRoute>
                        }
                    />

                    <Route
                        path={ROUTES.REGISTER}
                        element={
                            <PublicRoute>
                                <LazyRoute>
                                    <PageTransition>
                                        <RegisterPage />
                                    </PageTransition>
                                </LazyRoute>
                            </PublicRoute>
                        }
                    />

                    <Route
                        path={ROUTES.HOME}
                        element={
                            <ProtectedRoute>
                                <AppShell>
                                    <LazyRoute>
                                        <PageTransition>
                                            <SearchDashboard />
                                        </PageTransition>
                                    </LazyRoute>
                                </AppShell>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path={ROUTES.SEARCH}
                        element={
                            <ProtectedRoute>
                                <AppShell>
                                    <LazyRoute>
                                        <PageTransition>
                                            <SearchDashboard />
                                        </PageTransition>
                                    </LazyRoute>
                                </AppShell>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path={ROUTES.ANALYTICS}
                        element={
                            <ProtectedRoute>
                                <PremiumRoute>
                                    <AppShell>
                                        <LazyRoute>
                                            <PageTransition>
                                                <AnalyticsDashboard />
                                            </PageTransition>
                                        </LazyRoute>
                                    </AppShell>
                                </PremiumRoute>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path={ROUTES.COMPARE}
                        element={
                            <ProtectedRoute>
                                <AppShell>
                                    <LazyRoute>
                                        <PageTransition>
                                            <MorphingGrid results={[]} />
                                        </PageTransition>
                                    </LazyRoute>
                                </AppShell>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path={`${ROUTES.ADMIN}/*`}
                        element={
                            <AdminRoute>
                                <AppShell>
                                    <LazyRoute>
                                        <PageTransition>
                                            <div className="p-8">
                                                <h1 className="text-3xl font-bold">Admin Panel</h1>
                                                <p className="text-gray-400 mt-2">Manage your system</p>
                                            </div>
                                        </PageTransition>
                                    </LazyRoute>
                                </AppShell>
                            </AdminRoute>
                        }
                    />

                    <Route
                        path={ROUTES.ERROR}
                        element={
                            <LazyRoute>
                                <ErrorPage />
                            </LazyRoute>
                        }
                    />

                    <Route
                        path={ROUTES.NOTFOUND}
                        element={
                            <LazyRoute>
                                <NotFoundPage />
                            </LazyRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to={ROUTES.NOTFOUND} replace />} />
                </Routes>
            </AnimatePresence>
        </Suspense>
    );
}