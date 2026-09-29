import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiActivity, FiArrowRight, FiClock, FiHeart, FiSettings } from 'react-icons/fi';
import { API_CONFIG } from '../constants/config';
import apiClient from '../api/client';
import { ROUTES } from '../constants/routes';

type ModuleSection = 'history' | 'favorites' | 'monitoring' | 'settings';

const SETTINGS_LINKS = [
    { label: 'Profile', path: ROUTES.SETTINGS_PROFILE },
    { label: 'Security', path: ROUTES.SETTINGS_SECURITY },
    { label: 'Notifications', path: ROUTES.SETTINGS_NOTIFICATIONS },
    { label: 'API Keys', path: ROUTES.SETTINGS_API },
];

export default function WorkspaceModulePage({ section }: { section: ModuleSection }) {
    const location = useLocation();
    const [serviceStatus, setServiceStatus] = useState<'checking' | 'healthy' | 'unavailable'>('checking');

    useEffect(() => {
        if (section !== 'monitoring') return;

        let active = true;
        apiClient.get<{ status: string }>(API_CONFIG.endpoints.health.check)
            .then((health) => {
                if (active) setServiceStatus(health.status === 'healthy' ? 'healthy' : 'unavailable');
            })
            .catch(() => {
                if (active) setServiceStatus('unavailable');
            });

        return () => {
            active = false;
        };
    }, [section]);

    const settingsTitle = SETTINGS_LINKS.find((item) => item.path === location.pathname)?.label;
    const title = section === 'history'
        ? 'Search History'
        : section === 'favorites'
            ? 'Favorites'
            : section === 'monitoring'
                ? 'System Monitoring'
                : settingsTitle || 'Settings';
    const Icon = section === 'history'
        ? FiClock
        : section === 'favorites'
            ? FiHeart
            : section === 'monitoring'
                ? FiActivity
                : FiSettings;

    return (
        <section className="min-h-[calc(100vh-8rem)] px-5 py-8 text-white sm:px-8">
            <div className="mx-auto max-w-5xl">
                <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                    <span className="flex h-10 w-10 items-center justify-center border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                        <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <div>
                        <h1 className="text-xl font-semibold">{title}</h1>
                        <p className="mt-1 text-sm text-gray-400">Chronos Search workspace</p>
                    </div>
                </div>

                {section === 'settings' ? (
                    <div className="mt-6 grid gap-2 sm:grid-cols-2">
                        {SETTINGS_LINKS.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center justify-between border px-4 py-3 text-sm transition ${location.pathname === item.path ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200' : 'border-white/10 text-gray-300 hover:border-white/25 hover:bg-white/5'}`}
                            >
                                {item.label}
                                <FiArrowRight aria-hidden="true" />
                            </Link>
                        ))}
                    </div>
                ) : section === 'monitoring' ? (
                    <div className="mt-6 max-w-xl border border-white/10 bg-black/20 p-5">
                        <p className="text-xs font-mono uppercase text-gray-500">Backend API</p>
                        <p className={`mt-3 text-sm ${serviceStatus === 'healthy' ? 'text-emerald-300' : serviceStatus === 'unavailable' ? 'text-red-300' : 'text-gray-300'}`}>
                            {serviceStatus === 'checking' ? 'Checking service status...' : serviceStatus === 'healthy' ? 'Healthy and responding' : 'Unavailable'}
                        </p>
                    </div>
                ) : (
                    <div className="mt-8 max-w-xl border border-white/10 bg-black/20 p-6">
                        <p className="text-sm text-gray-200">
                            {section === 'history'
                                ? 'Your completed searches will appear here.'
                                : 'Results you save will appear here.'}
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                            {section === 'history'
                                ? 'Search history is not available yet.'
                                : 'Saving and syncing favorites is not available yet.'}
                        </p>
                        <Link
                            to={ROUTES.SEARCH}
                            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-300 hover:text-cyan-200"
                        >
                            Go to search <FiArrowRight aria-hidden="true" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}