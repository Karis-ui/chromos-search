import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';
import { create } from 'zustand';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationStore {
  notifications: Notification[];
  add: (notification: Omit<Notification, 'id'>) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  add: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` },
      ],
    })),
  remove: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clear: () => set({ notifications: [] }),
}));

const NotificationItem: React.FC<{ notification: Notification; onRemove: (id: string) => void }> = ({
  notification,
  onRemove,
}) => {
  const { id, type, title, message, duration = 4000, action } = notification;

  useEffect(() => {
    const timer = setTimeout(() => onRemove(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  const configs = {
    success: {
      icon: FiCheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      glow: 'shadow-green-500/10',
    },
    error: {
      icon: FiAlertCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      glow: 'shadow-red-500/10',
    },
    warning: {
      icon: FiAlertTriangle,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      glow: 'shadow-yellow-500/10',
    },
    info: {
      icon: FiInfo,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      glow: 'shadow-cyan-500/10',
    },
  };

  const config = configs[type] || configs.info;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`relative w-80 md:w-96 p-4 rounded-2xl ${config.bg} ${config.border} ${config.glow} 
        backdrop-blur-xl border shadow-2xl overflow-hidden`}
    >
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-${type === 'success' ? 'green' : type === 'error' ? 'red' : type === 'warning' ? 'yellow' : 'cyan'}-400 to-transparent animate-pulse`} />

      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl ${config.bg} border ${config.border}`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          {title && (
            <p className={`text-sm font-semibold ${config.color}`}>{title}</p>
          )}
          <p className="text-sm text-gray-300 mt-0.5">{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className={`mt-2 text-xs font-medium ${config.color} hover:opacity-80 transition-opacity`}
            >
              {action.label}
            </button>
          )}
        </div>

        <button
          onClick={() => onRemove(id)}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
        >
          <FiX className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <motion.div
        className={`absolute bottom-0 left-0 h-0.5 ${config.bg}`}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
      />
    </motion.div>
  );
};

export const NotificationContainer: React.FC = () => {
  const { notifications, remove } = useNotificationStore();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationItem notification={notification} onRemove={remove} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const useNotification = () => {
  const add = useNotificationStore((state) => state.add);

  return {
    success: (message: string, title?: string) =>
      add({ type: 'success', title, message }),
    error: (message: string, title?: string) =>
      add({ type: 'error', title, message }),
    warning: (message: string, title?: string) =>
      add({ type: 'warning', title, message }),
    info: (message: string, title?: string) =>
      add({ type: 'info', title, message }),
    custom: (notification: Omit<Notification, 'id'>) => add(notification),
  };
};