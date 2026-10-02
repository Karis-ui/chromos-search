import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiShield,
  FiEye,
  FiEyeOff,
  FiCamera,
  FiDollarSign,
  FiChevronRight,
  FiZap,
  FiUser,
  FiActivity,
} from 'react-icons/fi';

import { GlassCard } from '../common/GlassCard';
import { GradientButton } from '../common/GradientButton';
import { RevokeConsent } from './RevokeConsent';
import { useConsent } from '../../hooks/useConsent';
import { ROUTES } from '../../constants/routes';

interface ConsentStatusProps {
  compact?: boolean;
}

export const ConsentStatus: React.FC<ConsentStatusProps> = ({ compact = false }) => {
  const { profile, hasConsent, isActive, faceCount } = useConsent();
  const [showRevoke, setShowRevoke] = useState(false);

  if (!hasConsent || !isActive) {
    return (
      <GlassCard
        variant="dark"
        padding={compact ? 'md' : 'lg'}
        glow="cyan"
        glowIntensity="low"
        className="relative overflow-hidden"
      >
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)',
          }}
        />

        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <FiEyeOff className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Not Searchable
                </p>
                <p className="text-[10px] text-gray-500 font-mono">
                  Consent not granted
                </p>
              </div>
            </div>
          </div>

          {!compact && (
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              You haven't signed up to be searchable on Chronos. Enable this
              to make your profile findable and start earning rewards.
            </p>
          )}

          <Link to={ROUTES.CONSENT}>
            <GradientButton
              variant="rainbow"
              size="sm"
              fullWidth
              icon={<FiChevronRight />}
              iconPosition="right"
              pulse
            >
              Become Searchable
            </GradientButton>
          </Link>
        </div>
      </GlassCard>
    );
  }

  if (compact) {
    return (
      <>
        <GlassCard
          variant="dark"
          padding="md"
          glow="green"
          glowIntensity="low"
          className="relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                  <FiEye className="w-5 h-5 text-green-400" />
                </div>
                <motion.div
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-gray-950"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  You're Searchable
                </p>
                <p className="text-[10px] text-gray-500 font-mono">
                  {faceCount} photos indexed
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowRevoke(true)}
              className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 transition-all group"
              title="Revoke consent"
            >
              <FiEyeOff className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
            </button>
          </div>
        </GlassCard>

        <RevokeConsent
          isOpen={showRevoke}
          onClose={() => setShowRevoke(false)}
        />
      </>
    );
  }

  return (
    <>
      <GlassCard
        variant="dark"
        padding="lg"
        glow="green"
        glowIntensity="low"
        className="relative overflow-hidden"
      >
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)',
          }}
        />

        <div className="relative space-y-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                  <FiEye className="w-6 h-6 text-green-400" />
                </div>
                <motion.div
                  className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-gray-950"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <p className="text-base font-bold text-white">
                  You're Searchable
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  Live on Chronos since{' '}
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : 'today'}
                </p>
              </div>
            </div>

            {profile?.is_verified && (
              <div className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center gap-1">
                <FiShield className="w-3 h-3 text-cyan-400" />
                <span className="text-[9px] font-bold text-cyan-400 font-mono">
                  VERIFIED
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <StatBox
              icon={FiCamera}
              label="Photos"
              value={String(faceCount)}
              color="#06b6d4"
            />
            <StatBox
              icon={FiActivity}
              label="Searches"
              value={String(profile?.lifetime_searches || 0)}
              color="#a855f7"
            />
            <StatBox
              icon={FiDollarSign}
              label="Earned"
              value={`$${(profile?.total_earnings || 0).toFixed(2)}`}
              color="#22c55e"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Link to={ROUTES.PROFILE('')} className="flex-1">
              <button className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-xs text-gray-300 hover:text-white font-mono flex items-center justify-center gap-2">
                <FiUser className="w-3 h-3" />
                Manage Profile
              </button>
            </Link>

            <button
              onClick={() => setShowRevoke(true)}
              className="px-3 py-2 bg-red-500/5 hover:bg-red-500/10 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all text-xs text-red-400 font-mono flex items-center gap-2"
            >
              <FiEyeOff className="w-3 h-3" />
              Revoke
            </button>
          </div>

          {profile?.last_searched_at && (
            <div className="flex items-center gap-2 pt-3 border-t border-white/5 text-[10px] text-gray-500 font-mono">
              <FiZap className="w-3 h-3 text-yellow-400" />
              <span>
                Last found:{' '}
                {new Date(profile.last_searched_at).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </GlassCard>

      {/* ── Revoke Modal ── */}
      <RevokeConsent
        isOpen={showRevoke}
        onClose={() => setShowRevoke(false)}
      />
    </>
  );
};

const StatBox: React.FC<{
  icon: any;
  label: string;
  value: string;
  color: string;
}> = ({ icon: Icon, label, value, color }) => (
  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 text-center">
    <Icon
      className="w-3.5 h-3.5 mx-auto mb-1"
      style={{ color }}
    />
    <p className="text-sm font-bold text-white font-mono">{value}</p>
    <p className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">
      {label}
    </p>
  </div>
);

export default ConsentStatus;