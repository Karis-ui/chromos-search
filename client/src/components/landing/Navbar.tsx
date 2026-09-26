import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import {
    FiMenu,
    FiX,
    FiCpu,
    FiArrowRight,
    FiUser,
    FiLogIn,
    FiChevronRight,
    FiStar,
    FiActivity,
} from 'react-icons/fi';

import { GradientButton } from '../common/GradientButton';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { APP_CONFIG } from '../../constants/config';

interface NavbarProps {
    onScrollTo: (id: string) => void;
    onAuthClick?: () => void;
}

interface NavLink {
    id: string;
    label: string;
    icon?: React.ReactNode;
    badge?: string;
}

const NAV_LINKS: NavLink[] = [
    { id: 'features', label: 'Features' },
    { id: 'demo', label: 'Live Demo', badge: 'NEW' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'faq', label: 'FAQ' },
];

export const Navbar: React.FC<NavbarProps> = ({ onScrollTo }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, logout } = useAuth();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<string>('hero');
    const [, setScrollProgress] = useState(0);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);

    const navRef = useRef<HTMLElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const { scrollY, scrollYProgress } = useScroll();

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    useEffect(() => {
        const unsubscribe = scrollY.on('change', (latest) => {
            setIsScrolled(latest > 20);
        });
        return () => unsubscribe();
    }, [scrollY]);

    useEffect(() => {
        const unsubscribe = scrollYProgress.on('change', (latest) => {
            setScrollProgress(latest * 100);
        });
        return () => unsubscribe();
    }, [scrollYProgress]);

    useEffect(() => {
        const sections = ['hero', 'features', 'demo', 'how-it-works', 'stats', 'testimonials', 'pricing', 'faq', 'cta'];

        const observers: IntersectionObserver[] = [];

        sections.forEach((sectionId) => {
            const element = document.getElementById(sectionId);
            if (!element) return;

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setActiveSection(sectionId);
                        }
                    });
                },
                {
                    rootMargin: '-100px 0px -60% 0px',
                    threshold: 0,
                }
            );

            observer.observe(element);
            observers.push(observer);
        });

        return () => {
            observers.forEach((observer) => observer.disconnect());
        };
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target as Node)
            ) {
                setShowUserMenu(false);
            }
        };

        if (showUserMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showUserMenu]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsMobileMenuOpen(false);
                setShowUserMenu(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            const rect = navRef.current?.getBoundingClientRect();
            if (!rect) return;

            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
            mouseX.set(x);
            mouseY.set(y);
        },
        [mouseX, mouseY]
    );

    const handleMouseLeave = useCallback(() => {
        mouseX.set(0);
        mouseY.set(0);
    }, [mouseX, mouseY]);

    const handleNavClick = useCallback(
        (id: string) => {
            onScrollTo(id);
            setIsMobileMenuOpen(false);
            setHoveredLink(null);
        },
        [onScrollTo]
    );

    const handleSignIn = useCallback(() => {
        setIsMobileMenuOpen(false);
        navigate(ROUTES.LOGIN);
    }, [navigate]);

    const handleGetStarted = useCallback(() => {
        setIsMobileMenuOpen(false);
        navigate(ROUTES.REGISTER);
    }, [navigate]);

    const handleDashboard = useCallback(() => {
        setIsMobileMenuOpen(false);
        navigate(ROUTES.DASHBOARD);
    }, [navigate]);

    const handleLogout = useCallback(async () => {
        setIsMobileMenuOpen(false);
        setShowUserMenu(false);
        await logout();
    }, [logout]);

    const userInitials = useMemo(() => {
        if (!user) return '?';
        if (user.full_name) {
            return user.full_name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();
        }
        return user.username?.slice(0, 2).toUpperCase() || '?';
    }, [user]);

    return (
        <>
            <motion.nav
                ref={navRef}
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300
          ${isScrolled
                        ? 'bg-black/70 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-black/40'
                        : 'bg-transparent'
                    }
        `}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        <Link
                            to={ROUTES.HOME}
                            className="flex items-center gap-3 group relative"
                            onClick={(e) => {
                                if (location.pathname === ROUTES.HOME) {
                                    e.preventDefault();
                                    onScrollTo('hero');
                                }
                            }}
                        >
                            <motion.div
                                className="relative"
                                style={{
                                    x: useTransform(springX, [-1, 1], [-2, 2]),
                                    y: useTransform(springY, [-1, 1], [-2, 2]),
                                }}
                            >
                                <motion.div
                                    className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25"
                                    whileHover={{ rotate: 180, scale: 1.1 }}
                                    transition={{ duration: 0.6, type: 'spring' }}
                                >
                                    <FiCpu className="w-5 h-5 text-white" />
                                </motion.div>

                                <motion.div
                                    className="absolute -inset-2 bg-gradient-to-r from-cyan-400/20 to-purple-600/20 rounded-2xl blur-xl -z-10"
                                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                                />

                                <motion.div
                                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-gray-950"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            </motion.div>

                            <div className="hidden sm:block">
                                <p className="text-base font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    {APP_CONFIG.name}
                                </p>
                                <p className="text-[9px] text-gray-500 font-mono tracking-wider">
                                    v{APP_CONFIG.version}
                                </p>
                            </div>
                        </Link>

                        <div className="hidden lg:flex items-center gap-1">
                            {NAV_LINKS.map((link) => (
                                <NavLinkItem
                                    key={link.id}
                                    link={link}
                                    isActive={activeSection === link.id}
                                    isHovered={hoveredLink === link.id}
                                    onHover={setHoveredLink}
                                    onClick={() => handleNavClick(link.id)}
                                />
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            {isAuthenticated && user ? (
                                <div className="relative hidden sm:block" ref={userMenuRef}>
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 rounded-xl transition-all group"
                                    >
                                        <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                                            {userInitials}
                                            <motion.div
                                                className="absolute -inset-0.5 rounded-full border border-cyan-400/50"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                                            />
                                        </div>

                                        <span className="text-xs text-gray-300 font-mono hidden md:block max-w-[80px] truncate">
                                            {user.username}
                                        </span>

                                        <motion.div
                                            animate={{ rotate: showUserMenu ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <FiChevronRight className="w-3 h-3 text-gray-500 rotate-90" />
                                        </motion.div>
                                    </button>

                                    <AnimatePresence>
                                        {showUserMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                                className="absolute right-0 mt-2 w-64 bg-black/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden"
                                            >
                                                <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-b border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                                                            {userInitials}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-white truncate">
                                                                {user.full_name || user.username}
                                                            </p>
                                                            <p className="text-xs text-gray-400 font-mono truncate">
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {user.role !== 'user' && (
                                                        <div className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded-full">
                                                            <FiStar className="w-2.5 h-2.5 text-purple-400" />
                                                            <span className="text-[9px] font-bold text-purple-400 font-mono uppercase">
                                                                {user.role.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-2">
                                                    <MenuItem
                                                        icon={<FiActivity className="w-4 h-4" />}
                                                        label="Dashboard"
                                                        onClick={handleDashboard}
                                                    />
                                                    <MenuItem
                                                        icon={<FiUser className="w-4 h-4" />}
                                                        label="Profile"
                                                        onClick={() => {
                                                            setShowUserMenu(false);
                                                            navigate(ROUTES.PROFILE("default"));
                                                        }}
                                                    />
                                                    <MenuItem
                                                        icon={<FiStar className="w-4 h-4" />}
                                                        label="Upgrade to Pro"
                                                        onClick={() => {
                                                            setShowUserMenu(false);
                                                            navigate(ROUTES.PREMIUM);
                                                        }}
                                                        highlight
                                                    />
                                                </div>

                                                <div className="p-2 border-t border-white/5">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <FiLogIn className="w-4 h-4 rotate-180" />
                                                        <span className="font-mono">Sign Out</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={handleSignIn}
                                        className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors font-mono group"
                                    >
                                        <FiLogIn className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                        <span>Sign In</span>
                                    </button>

                                    <GradientButton
                                        variant="rainbow"
                                        size="sm"
                                        icon={<FiArrowRight />}
                                        iconPosition="right"
                                        onClick={handleGetStarted}
                                        className="hidden sm:flex"
                                    >
                                        Get Started
                                    </GradientButton>
                                </>
                            )}

                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
                                aria-label="Toggle menu"
                            >
                                <AnimatePresence mode="wait">
                                    {isMobileMenuOpen ? (
                                        <motion.div
                                            key="close"
                                            initial={{ rotate: -90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: 90, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <FiX className="w-5 h-5 text-white" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="menu"
                                            initial={{ rotate: 90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: -90, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <FiMenu className="w-5 h-5 text-white" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>
                        </div>
                    </div>
                </div>

                <motion.div
                    className="absolute bottom-0 left-0 right-0 h-px origin-left bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"
                    style={{
                        scaleX: useTransform(scrollYProgress, [0, 1], [0, 1]),
                        opacity: isScrolled ? 1 : 0,
                        boxShadow: '0 0 12px rgba(168, 85, 247, 0.5)',
                    }}
                />

                <motion.div
                    className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
                    animate={{ opacity: isScrolled ? 1 : 0 }}
                />

                {isScrolled && (
                    <motion.div
                        className="absolute inset-x-0 bottom-0 h-px"
                        style={{
                            background:
                                'linear-gradient(90deg, transparent, rgba(34,211,238,0.3), rgba(168,85,247,0.3), transparent)',
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                )}
            </motion.nav>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xl lg:hidden"
                        />

                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed top-0 right-0 bottom-0 w-full max-w-sm z-50 bg-gradient-to-br from-gray-950 to-gray-900 border-l border-white/10 shadow-2xl lg:hidden overflow-y-auto"
                        >
                            <motion.div
                                className="absolute left-0 right-0 h-px pointer-events-none"
                                style={{
                                    background:
                                        'linear-gradient(90deg, transparent, rgba(34,211,238,0.3), transparent)',
                                }}
                                animate={{ top: ['0%', '100%'] }}
                                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                            />

                            <div className="flex flex-col h-full p-6">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
                                            <FiCpu className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                                                {APP_CONFIG.name}
                                            </p>
                                            <p className="text-[9px] text-gray-500 font-mono">
                                                v{APP_CONFIG.version}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
                                        aria-label="Close menu"
                                    >
                                        <FiX className="w-4 h-4 text-white" />
                                    </button>
                                </div>

                                {isAuthenticated && user && (
                                    <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl border border-cyan-500/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                                                {userInitials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">
                                                    {user.full_name || user.username}
                                                </p>
                                                <p className="text-xs text-gray-400 font-mono truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex-1 space-y-1">
                                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-3 px-3">
                                        Navigation
                                    </p>

                                    {NAV_LINKS.map((link, idx) => (
                                        <motion.button
                                            key={link.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + idx * 0.05 }}
                                            onClick={() => handleNavClick(link.id)}
                                            className={`
                        group w-full flex items-center justify-between
                        px-3 py-3 rounded-xl transition-all font-mono text-sm
                        ${activeSection === link.id
                                                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/10 text-white border border-cyan-500/30'
                                                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                                }
                      `}
                                        >
                                            <span>{link.label}</span>

                                            <div className="flex items-center gap-2">
                                                {link.badge && (
                                                    <span className="px-1.5 py-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded text-[8px] font-bold text-white">
                                                        {link.badge}
                                                    </span>
                                                )}
                                                <FiArrowRight
                                                    className={`w-4 h-4 transition-all ${activeSection === link.id
                                                        ? 'text-cyan-400 opacity-100'
                                                        : 'opacity-0 group-hover:opacity-100'
                                                        }`}
                                                />
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-white/10 space-y-3">
                                    {isAuthenticated && user ? (
                                        <>
                                            <button
                                                onClick={handleDashboard}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-sm font-semibold text-white font-mono shadow-lg shadow-purple-500/25"
                                            >
                                                <FiActivity className="w-4 h-4" />
                                                Go to Dashboard
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-sm font-semibold text-red-400 font-mono border border-red-500/20 transition-colors"
                                            >
                                                <FiLogIn className="w-4 h-4 rotate-180" />
                                                Sign Out
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleSignIn}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-semibold text-gray-300 hover:text-white font-mono border border-white/10 transition-colors"
                                            >
                                                <FiLogIn className="w-4 h-4" />
                                                Sign In
                                            </button>
                                            <button
                                                onClick={handleGetStarted}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-xl text-sm font-semibold text-white font-mono shadow-lg shadow-purple-500/25"
                                            >
                                                Get Started Free
                                                <FiArrowRight className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>

                                <div className="mt-6 pt-4 border-t border-white/5">
                                    <div className="flex items-center justify-between text-[9px] text-gray-600 font-mono">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                            <span>ALL SYSTEMS ONLINE</span>
                                        </div>
                                        <span>{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

interface NavLinkItemProps {
    link: NavLink;
    isActive: boolean;
    isHovered: boolean;
    onHover: (id: string | null) => void;
    onClick: () => void;
}

const NavLinkItem: React.FC<NavLinkItemProps> = ({
    link,
    isActive,
    isHovered,
    onHover,
    onClick,
}) => {
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => onHover(link.id)}
            onMouseLeave={() => onHover(null)}
            className="relative px-4 py-2 text-sm transition-colors group"
        >
            <div className="relative z-10 flex items-center gap-2">
                <span
                    className={`font-mono transition-colors ${isActive
                        ? 'text-white'
                        : 'text-gray-400 group-hover:text-white'
                        }`}
                >
                    {link.label}
                </span>

                {link.badge && (
                    <span className="px-1.5 py-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded text-[8px] font-bold text-white">
                        {link.badge}
                    </span>
                )}
            </div>

            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        layoutId="nav-hover"
                        className="absolute inset-0 rounded-xl bg-white/5 border border-white/5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </AnimatePresence>

            {isActive && (
                <motion.div
                    layoutId="nav-active"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
            )}
        </button>
    );
};

interface MenuItemProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    highlight?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onClick, highlight }) => {
    return (
        <button
            onClick={onClick}
            className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
        text-sm transition-all group
        ${highlight
                    ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-cyan-400 hover:from-cyan-500/20 hover:to-purple-500/20 border border-cyan-500/20'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }
      `}
        >
            <span
                className={`flex-shrink-0 ${highlight ? 'text-cyan-400' : 'text-gray-500 group-hover:text-cyan-400'
                    } transition-colors`}
            >
                {icon}
            </span>
            <span className="font-mono flex-1 text-left">{label}</span>
            <FiChevronRight
                className={`
          w-3 h-3 opacity-0 group-hover:opacity-100 transition-all
          -translate-x-2 group-hover:translate-x-0
          ${highlight ? 'text-cyan-400' : 'text-gray-500'}
        `}
            />
        </button>
    );
};

export default Navbar;