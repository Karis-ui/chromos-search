import React from 'react';
import { motion } from 'framer-motion';
import {
  FiEye, FiMic, FiGlobe, FiClock, FiShield, FiZap,
  FiCpu, FiTrendingUp, FiUsers, FiTarget,
} from 'react-icons/fi';

import { GlassCard } from '../common/GlassCard';

const FEATURES = [
  {
    icon: FiEye,
    title: 'Face Recognition',
    description: 'Military-grade facial recognition using InsightFace. 512-dim embeddings. 99.8% accuracy.',
    color: '#06b6d4',
    gradient: 'from-cyan-500/20 to-cyan-600/5',
  },
  {
    icon: FiMic,
    title: 'Voice Matching',
    description: 'Neural voice fingerprinting with Whisper AI. Identify anyone by voice print alone.',
    color: '#a855f7',
    gradient: 'from-purple-500/20 to-purple-600/5',
  },
  {
    icon: FiGlobe,
    title: '12 Platforms',
    description: 'Search across Instagram, TikTok, Twitter, Facebook, YouTube, and more in one query.',
    color: '#ec4899',
    gradient: 'from-pink-500/20 to-pink-600/5',
  },
  {
    icon: FiClock,
    title: '6-Month History',
    description: 'Deep temporal search going back 180 days. Perfect for cold case investigation.',
    color: '#f97316',
    gradient: 'from-orange-500/20 to-orange-600/5',
  },
  {
    icon: FiCpu,
    title: 'AI Powered',
    description: 'State-of-the-art neural networks running on GPU. Sub-5 second searches.',
    color: '#eab308',
    gradient: 'from-yellow-500/20 to-yellow-600/5',
  },
  {
    icon: FiShield,
    title: 'Enterprise Security',
    description: 'TLS 1.3, AES-256 encryption. JWT authentication. SOC 2 compliant.',
    color: '#22c55e',
    gradient: 'from-green-500/20 to-green-600/5',
  },
  {
    icon: FiTrendingUp,
    title: 'Real-time Analytics',
    description: 'Live dashboards with confidence scoring, temporal heatmaps, and trend analysis.',
    color: '#3b82f6',
    gradient: 'from-blue-500/20 to-blue-600/5',
  },
  {
    icon: FiUsers,
    title: 'Team Collaboration',
    description: 'Share investigations, assign cases, and collaborate with your team in real-time.',
    color: '#8b5cf6',
    gradient: 'from-violet-500/20 to-violet-600/5',
  },
  {
    icon: FiTarget,
    title: 'Precision Matching',
    description: 'Adjustable confidence thresholds from 50% to 95%. Zero false positives.',
    color: '#06b6d4',
    gradient: 'from-cyan-500/20 to-cyan-600/5',
  },
];

export const FeatureGrid: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-4">
          <FiZap className="w-3 h-3 text-cyan-400" />
          <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">
            Capabilities
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
          <span className="text-white">Built for </span>
          <span className="shimmer-text">Digital Investigators</span>
        </h2>

        <p className="max-w-2xl mx-auto text-gray-400 text-base sm:text-lg">
          Every feature crafted for professional investigators, security researchers, and digital forensics experts.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
          >
            <GlassCard
              variant="dark"
              hover
              hoverEffect="lift"
              className="h-full p-6 group"
            >
              <div className="relative mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon
                    className="w-6 h-6"
                    style={{ color: feature.color }}
                  />
                </div>
                <div
                  className="absolute -inset-2 rounded-xl blur-lg -z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `${feature.color}20` }}
                />
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-500 transition-all">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FeatureGrid;