import React from 'react';
import { Link } from 'react-router-dom';
import {
    FiCpu, FiGithub, FiTwitter, FiLinkedin, FiMail,
    FiShield,
} from 'react-icons/fi';

import { ROUTES } from '../../constants/routes';
import { APP_CONFIG } from '../../constants/config';

const FOOTER_LINKS = {
    product: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Demo', href: '#demo' },
        { label: 'API Docs', href: '/docs' },
    ],
    company: [
        { label: 'About', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Careers', href: '/careers' },
        { label: 'Contact', href: '/contact' },
    ],
    legal: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' },
        { label: 'GDPR', href: '/gdpr' },
    ],
    resources: [
        { label: 'Documentation', href: '/docs' },
        { label: 'Help Center', href: '/help' },
        { label: 'System Status', href: '/status' },
        { label: 'Changelog', href: '/changelog' },
    ],
};

const SOCIALS = [
    { icon: FiGithub, href: 'https://github.com', label: 'GitHub' },
    { icon: FiTwitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: FiLinkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: FiMail, href: 'mailto:support@chronos.io', label: 'Email' },
];

export const FooterSection: React.FC = () => {
    return (
        <footer className="relative pt-20 pb-10 border-t border-white/5 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
                    <div className="col-span-2 md:col-span-3 lg:col-span-2">
                        <Link to={ROUTES.HOME} className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                                <FiCpu className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-base font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    {APP_CONFIG.name}
                                </p>
                                <p className="text-[9px] text-gray-500 font-mono tracking-wider">
                                    v{APP_CONFIG.version}
                                </p>
                            </div>
                        </Link>

                        <p className="text-sm text-gray-400 mb-6 max-w-xs">
                            AI-powered biometric search across 12 social platforms. The future of digital investigation.
                        </p>

                        <div className="flex items-center gap-2">
                            {SOCIALS.map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.label}
                                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 flex items-center justify-center transition-all group"
                                >
                                    <social.icon className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-white mb-4 font-mono uppercase tracking-wider">
                            Product
                        </h3>
                        <ul className="space-y-2">
                            {FOOTER_LINKS.product.map((link, idx) => (
                                <li key={idx}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-white mb-4 font-mono uppercase tracking-wider">
                            Company
                        </h3>
                        <ul className="space-y-2">
                            {FOOTER_LINKS.company.map((link, idx) => (
                                <li key={idx}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-white mb-4 font-mono uppercase tracking-wider">
                            Resources
                        </h3>
                        <ul className="space-y-2">
                            {FOOTER_LINKS.resources.map((link, idx) => (
                                <li key={idx}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-white mb-4 font-mono uppercase tracking-wider">
                            Legal
                        </h3>
                        <ul className="space-y-2">
                            {FOOTER_LINKS.legal.map((link, idx) => (
                                <li key={idx}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-500 font-mono">
                        © {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span>All Systems Operational</span>
                        </div>
                        <span className="text-gray-700">|</span>
                        <div className="flex items-center gap-1">
                            <FiShield className="w-3 h-3 text-green-400" />
                            <span>SOC 2 Compliant</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterSection;