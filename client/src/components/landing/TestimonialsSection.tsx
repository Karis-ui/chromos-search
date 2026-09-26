import React from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiMessageSquare } from 'react-icons/fi';
import { GlassCard } from '../common/GlassCard';

const TESTIMONIALS = [
    {
        name: 'Sarah Chen',
        role: 'Forensic Analyst',
        company: 'CyberSafe Investigations',
        avatar: 'SC',
        quote: 'Chronos turned a 3-day investigation into a 30-second search. The facial recognition is staggeringly accurate.',
        rating: 5,
        color: '#06b6d4',
    },
    {
        name: 'Marcus Rodriguez',
        role: 'Security Researcher',
        company: 'TechDefense Labs',
        avatar: 'MR',
        quote: 'The 6-month temporal search is a game-changer. I can find people who thought they\'d covered their tracks.',
        rating: 5,
        color: '#a855f7',
    },
    {
        name: 'Emma Williams',
        role: 'Journalist',
        company: 'The Daily Investigation',
        avatar: 'EW',
        quote: 'Voice matching across platforms saved me weeks of manual work. This is the future of OSINT.',
        rating: 5,
        color: '#ec4899',
    },
    {
        name: 'David Kim',
        role: 'Legal Investigator',
        company: 'Justice & Associates',
        avatar: 'DK',
        quote: 'Court-admissible evidence with sub-second response times. The chain of custody is impeccable.',
        rating: 5,
        color: '#22c55e',
    },
    {
        name: 'Aisha Patel',
        role: 'Missing Persons Unit',
        company: 'Metro Police Department',
        avatar: 'AP',
        quote: 'We\'ve located 47 missing persons using Chronos. This tool saves lives. Period.',
        rating: 5,
        color: '#f97316',
    },
    {
        name: 'James Foster',
        role: 'Private Investigator',
        company: 'Foster Investigations',
        avatar: 'JF',
        quote: 'I\'ve tried every tool on the market. Nothing comes close to Chronos. It\'s not even a contest.',
        rating: 5,
        color: '#eab308',
    },
];

export const TestimonialsSection: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full mb-4">
                    <FiMessageSquare className="w-3 h-3 text-yellow-400" />
                    <span className="text-[10px] text-yellow-400 font-mono uppercase tracking-wider">
                        Testimonials
                    </span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
                    <span className="text-white">Loved By </span>
                    <span className="shimmer-text">Professionals</span>
                </h2>

                <p className="max-w-2xl mx-auto text-gray-400 text-base sm:text-lg">
                    From law enforcement to investigative journalism — see why professionals choose Chronos.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TESTIMONIALS.map((testimonial, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                    >
                        <GlassCard
                            variant="dark"
                            hover
                            hoverEffect="lift"
                            padding="lg"
                            className="h-full flex flex-col"
                        >
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <FiStar
                                        key={i}
                                        className="w-4 h-4 fill-current"
                                        style={{ color: '#facc15' }}
                                    />
                                ))}
                            </div>

                            <p className="text-sm text-gray-300 leading-relaxed mb-6 flex-1 italic">
                                "{testimonial.quote}"
                            </p>
                            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white"
                                    style={{
                                        background: `linear-gradient(135deg, ${testimonial.color}, ${testimonial.color}80)`,
                                    }}
                                >
                                    {testimonial.avatar}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">
                                        {testimonial.name}
                                    </p>
                                    <p className="text-xs text-gray-500 font-mono truncate">
                                        {testimonial.role} • {testimonial.company}
                                    </p>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default TestimonialsSection;