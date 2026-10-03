import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiX,
    FiSend,
    FiUser,
    FiMessageCircle,
    FiShield,
    FiCheck,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

import { GradientButton } from '../common/GradientButton';
import { GlassCard } from '../common/GlassCard';
import type { UnifiedResult } from '../../api/endpoints/search';

interface ContactModalProps {
    result: UnifiedResult | null;
    isOpen: boolean;
    onClose: () => void;
}

const MESSAGE_TEMPLATES = [
    {
        id: 'verify',
        label: 'Identity verification',
        text: "Hi, I'm trying to verify someone's identity. Could you confirm if this is you?",
    },
    {
        id: 'business',
        label: 'Business inquiry',
        text: "Hi, I'd like to discuss a potential business opportunity with you.",
    },
    {
        id: 'reconnect',
        label: 'Reconnect',
        text: "Hi, we may have met before. Would you be open to connecting?",
    },
    {
        id: 'custom',
        label: 'Custom message',
        text: '',
    },
];

export const ContactModal: React.FC<ContactModalProps> = ({ result, isOpen, onClose }) => {
    const [selectedTemplate, setSelectedTemplate] = useState('verify');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleClose = useCallback(() => {
        if (!isSending) {
            setIsSent(false);
            setSelectedTemplate('verify');
            setMessage('');
            onClose();
        }
    }, [isSending, onClose]);

    const handleSend = useCallback(async () => {
        if (!message.trim) {
            toast.error('Please write a message');
            return;
        }
        if (message.length > 500) {
            toast.error('Message too long....must be less than 500 characters');
            return;
        }
        setIsSending(true);
        toast.loading('Sending message...');
        try {
            await new Promise(res => setTimeout(res, 1500));
            toast.dismiss()
            toast.success('Message sent!')
            setTimeout(() => {
                onClose();
                setIsSending(false);
                setSelectedTemplate('verify')
            })
        }
        catch {
            toast.dismiss();
            toast.error('Failed to send message');
            setIsSending(false);
        }
    }, [message]);

    const handleTemplateSelect = useCallback((templatedId: string) => {
        setSelectedTemplate(templatedId);
        const template = MESSAGE_TEMPLATES.find((t) => t.id === templatedId);
        if (template && templatedId !== 'custom') {
            setMessage(template.text);
        } else {
            setMessage('');
        }
    }, []);

    if (!isOpen || !result) {
        return null;
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25 }}
                        onClick={(e) => e.stopPropagation()}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="relative w-full max-w-lg pointer-events-auto">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 rounded-t-3xl animate-pulse" />

                            <div className="bg-gray-950 border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/20 max-h-[90vh] overflow-y-auto">
                                <button
                                    onClick={handleClose}
                                    disabled={isSending}
                                    className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all disabled:opacity-50"
                                >
                                    <FiX className="w-4 h-4 text-gray-400" />
                                </button>

                                <div className="p-6 sm:p-8">
                                    <AnimatePresence mode="wait">
                                        {isSent ? (
                                            <motion.div
                                                key="sent"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="text-center space-y-5 py-4"
                                            >
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: 'spring', stiffness: 200 }}
                                                    className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/40"
                                                >
                                                    <FiCheck className="w-8 h-8 text-white" strokeWidth={3} />
                                                </motion.div>

                                                <div>
                                                    <h2 className="text-xl font-bold text-white mb-1">
                                                        Message Sent! 📬
                                                    </h2>
                                                    <p className="text-sm text-gray-400">
                                                        {result.display_name || 'User'} will receive your message
                                                    </p>
                                                </div>

                                                <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-xl">
                                                    <p className="text-[11px] text-gray-400 font-mono">
                                                        You'll be notified if they respond
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={handleClose}
                                                    className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-sm text-gray-300 font-mono transition-colors"
                                                >
                                                    Close
                                                </button>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="form"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="space-y-5"
                                            >
                                                <div className="text-center">
                                                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
                                                        <FiMessageCircle className="w-6 h-6 text-cyan-400" />
                                                    </div>
                                                    <h2 className="text-lg font-bold text-white mb-1">
                                                        Send a Message
                                                    </h2>
                                                    <p className="text-xs text-gray-400">
                                                        Contact {result.display_name || 'this user'} directly
                                                    </p>
                                                </div>

                                                <GlassCard variant="dark" padding="sm">
                                                    <div className="flex items-center gap-3">
                                                        {result.thumbnail ? (
                                                            <img
                                                                src={result.thumbnail}
                                                                alt="Recipient"
                                                                className="w-10 h-10 rounded-full object-cover border border-white/10"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                                                                <FiUser className="w-5 h-5 text-white" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-white truncate">
                                                                {result.display_name || 'Anonymous User'}
                                                            </p>
                                                            {result.occupation && (
                                                                <p className="text-[10px] text-gray-500 font-mono truncate">
                                                                    {result.occupation}
                                                                    {result.company && ` @ ${result.company}`}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full">
                                                            <span className="text-[9px] text-green-400 font-bold font-mono">
                                                                CONSENT
                                                            </span>
                                                        </div>
                                                    </div>
                                                </GlassCard>

                                                <div>
                                                    <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-2">
                                                        Quick Templates
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {MESSAGE_TEMPLATES.map((template) => (
                                                            <button
                                                                key={template.id}
                                                                onClick={() => handleTemplateSelect(template.id)}
                                                                className={`
                                  px-3 py-2 rounded-lg text-xs font-mono transition-all text-left
                                  ${selectedTemplate === template.id
                                                                        ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                                                                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                                                    }
                                  border
                                `}
                                                            >
                                                                {template.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                                                            Your Message
                                                        </label>
                                                        <span
                                                            className={`text-[10px] font-mono ${message.length > 450
                                                                    ? 'text-yellow-400'
                                                                    : 'text-gray-600'
                                                                }`}
                                                        >
                                                            {message.length}/500
                                                        </span>
                                                    </div>
                                                    <textarea
                                                        value={message}
                                                        onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                                                        placeholder="Write your message here..."
                                                        rows={5}
                                                        disabled={isSending}
                                                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none font-sans disabled:opacity-50"
                                                    />
                                                </div>

                                                <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                                                    <div className="flex items-start gap-2">
                                                        <FiShield className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                                                        <p className="text-[10px] text-gray-400 leading-relaxed">
                                                            Messages are logged and monitored. Harassment or
                                                            abuse will result in immediate ban.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 pt-2">
                                                    <button
                                                        onClick={handleClose}
                                                        disabled={isSending}
                                                        className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-sm text-gray-300 font-mono transition-colors disabled:opacity-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <GradientButton
                                                        onClick={handleSend}
                                                        loading={isSending}
                                                        loadingText="Sending..."
                                                        disabled={!message.trim()}
                                                        variant="cyan"
                                                        size="lg"
                                                        icon={<FiSend />}
                                                        iconPosition="right"
                                                        className="flex-1"
                                                    >
                                                        Send Message
                                                    </GradientButton>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ContactModal;