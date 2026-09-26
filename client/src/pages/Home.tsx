import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';

import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { FeatureGrid } from '../components/landing/FeatureGrid';
import { LiveDemo } from '../components/landing/LiveDemo';
import { Works } from '../components/landing/Works';
import { StatsSection } from '../components/landing/StatsSection';
import { TestimonialsSection } from '../components/landing/TestimonialsSection';
import { PricingSection } from '../components/landing/PricingSection';
import { FAQSection } from '../components/landing/FAQSection';
import { CTASection } from '../components/landing/CTASection';
import { FooterSection } from '../components/landing/FooterSection';
import { ScrollProgress } from '../components/landing/ScrollProgress';

import { ParticleBackground } from '../components/common/ParticleBackground';
import { CyberGrid } from '../components/common/CyberGrid';

import { ROUTES } from '../constants/routes';

import { useAuth } from '../hooks/useAuth';


export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const containerRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLElement>(null);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    const { scrollYProgress } = useScroll();
    const scrollProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    const { scrollY } = useScroll();
    const heroY = useTransform(scrollY, [0, 800], [0, 200]);
    const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

    const [, setSystemTime] = useState(new Date());

    useEffect(() => {
        if (isAuthenticated) {
            navigate(ROUTES.HOME);
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const interval = setInterval(() => setSystemTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);
    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = (e.clientY / window.innerHeight) * 2 - 1;
            mouseX.set(x);
            mouseY.set(y);
        },
        [mouseX, mouseY]
    );

    const scrollToSection = useCallback((id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-x-hidden"
        >
            <ParticleBackground />

            <div className="fixed inset-0 z-0 pointer-events-none">
                <CyberGrid animated speed={0.2} opacity={0.02} />
            </div>

            <motion.div
                className="fixed top-0 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none z-0"
                style={{
                    background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)',
                    x: useTransform(springX, [-1, 1], [-40, 40]),
                    y: useTransform(springY, [-1, 1], [-40, 40]),
                }}
            />
            <motion.div
                className="fixed bottom-0 right-1/4 w-[600px] h-[600px] rounded-full pointer-events-none z-0"
                style={{
                    background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
                    x: useTransform(springX, [-1, 1], [40, -40]),
                    y: useTransform(springY, [-1, 1], [40, -40]),
                }}
            />

            <div
                className="fixed inset-0 pointer-events-none z-[5]"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
                }}
            />
            <ScrollProgress progress={scrollProgress} />
            <Navbar onScrollTo={scrollToSection} />
            <motion.section
                ref={heroRef}
                id="hero"
                className="relative w-full min-h-screen flex items-center justify-center pt-24 pb-16 z-10"
                style={{
                    y: heroY,
                    opacity: heroOpacity,
                }}
            >
                <HeroSection />
            </motion.section>
            <section id="features" className="relative py-24 z-10">
                <FeatureGrid />
            </section>
            <section id="demo" className="relative py-24 z-10">
                <LiveDemo />
            </section>
            <section id="how-it-works" className="relative py-24 z-10">
                <Works />
            </section>
            <section id="stats" className="relative py-24 z-10">
                <StatsSection />
            </section>
            <section id="testimonials" className="relative py-24 z-10">
                <TestimonialsSection />
            </section>
            <section id="pricing" className="relative py-24 z-10">
                <PricingSection />
            </section>
            <section id="faq" className="relative py-24 z-10">
                <FAQSection />
            </section>
            <section id="cta" className="relative py-24 z-10">
                <CTASection />
            </section>
            <FooterSection />
        </div>
    );
};

export default LandingPage;