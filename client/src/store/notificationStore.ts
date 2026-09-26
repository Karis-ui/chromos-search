import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface Notification {
    id: string;
    type: NotificationType;
    title?: string;
    message: string;
    duration?: number;
    priority: NotificationPriority;
    action?: {
        label: string;
        onClick: () => void;
    };
    dismissible: boolean;
    createdAt: number;
    metadata?: Record<string, any>;
}

export interface NotificationState {
    notifications: Notification[];
    maxNotifications: number;
    queue: Notification[];
    isPaused: boolean;

    add: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
    remove: (id: string) => void;
    clear: () => void;
    update: (id: string, updates: Partial<Notification>) => void;
    pause: () => void;
    resume: () => void;
    reset: () => void;
}

export const NOTIFICATION_DEFAULTS = {
    MAX_NOTIFICATIONS: 5,
    DEFAULT_PRIORITY: 'normal' as const,
    DEFAULT_DISMISSIBLE: true,
    DEFAULT_DURATION: 5000,
};

export const PRIORITY_ORDER: NotificationPriority[] = ['critical', 'high', 'normal', 'low'];

export const useNotificationStore = create<NotificationState>()(
    subscribeWithSelector(
        immer<NotificationState>((set, get) => ({
            notifications: [],
            maxNotifications: NOTIFICATION_DEFAULTS.MAX_NOTIFICATIONS,
            queue: [],
            isPaused: false,

            add(notification) {
                const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

                const defaults: Omit<Notification, 'id'> = {
                    type: 'info',
                    message: '',
                    priority: NOTIFICATION_DEFAULTS.DEFAULT_PRIORITY,
                    dismissible: NOTIFICATION_DEFAULTS.DEFAULT_DISMISSIBLE,
                    createdAt: Date.now(),
                    metadata: {},
                };

                const fullNotification: Notification = {
                    id,
                    ...defaults,
                    ...notification,
                    duration: notification.duration ?? (notification.type === 'loading' ? 0 : NOTIFICATION_DEFAULTS.DEFAULT_DURATION),
                };

                set((state) => {
                    if (!state.isPaused) {
                        state.notifications.push(fullNotification);
                        state.notifications.sort((a: Notification, b: Notification) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority));
                    } else {
                        state.queue.push(fullNotification);
                    }

                    if (state.notifications.length >= state.maxNotifications) {
                        state.notifications.shift();
                        state.notifications.push(fullNotification);
                    }

                    if (fullNotification.duration !== undefined && fullNotification.duration > 0) {
                        setTimeout(() => {
                            get().remove(id);
                        }, fullNotification.duration);
                    }
                });

                return id;
            },

            remove(id) {
                set((state) => {
                    state.notifications = state.notifications.filter((n: Notification) => n.id !== id);
                });
            },

            clear() {
                set({ notifications: [] });
            },

            update(id, updates) {
                set((state) => {
                    const notif = state.notifications.find((n: Notification) => n.id === id);
                    if (notif) {
                        Object.assign(notif, updates);
                        if (updates.priority) {
                            state.notifications.sort((a: Notification, b: Notification) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority));
                        }
                    }
                });
            },

            pause() {
                set({ isPaused: true });
            },

            resume() {
                set({ isPaused: false });
            },

            reset() {
                set({ notifications: [], queue: [], isPaused: false });
            },
        }))
    ),
);

export const selectors = {
    selectNotifications: (state: NotificationState) => state.notifications,
    selectActiveNotifications: (state: NotificationState) =>
        state.notifications.filter((n) => n.type !== 'loading'),
    selectLoadingNotifications: (state: NotificationState) =>
        state.notifications.filter((n) => n.type === 'loading'),
    selectHasNotifications: (state: NotificationState) => state.notifications.length > 0,
    selectFirstNotification: (state: NotificationState) => state.notifications[0],

    selectNotificationCount: (state: NotificationState) => state.notifications.length,
    selectSuccessCount: (state: NotificationState) =>
        state.notifications.filter((n) => n.type === 'success').length,
    selectErrorCount: (state: NotificationState) =>
        state.notifications.filter((n) => n.type === 'error').length,
    selectWarningCount: (state: NotificationState) =>
        state.notifications.filter((n) => n.type === 'warning').length,
    selectInfoCount: (state: NotificationState) =>
        state.notifications.filter((n) => n.type === 'info').length,

    selectByPriority: (priority: NotificationPriority) => (state: NotificationState) =>
        state.notifications.filter((n) => n.priority === priority),
    selectHighPriorityOnly: (state: NotificationState) =>
        state.notifications.filter((n) => ['high', 'critical'].includes(n.priority)),
    selectHighestPriority: (state: NotificationState) =>
        state.notifications.find((n) => n.priority === 'critical') ||
        state.notifications.find((n) => n.priority === 'high') ||
        state.notifications[0],

    selectActionableNotifications: (state: NotificationState) =>
        state.notifications.filter((n) => n.action !== undefined && n.dismissible),

    selectIsPaused: (state: NotificationState) => state.isPaused,
    selectMaxCapacity: (state: NotificationState) => state.maxNotifications,
    selectRemainingCapacity: (state: NotificationState) =>
        Math.max(0, state.maxNotifications - state.notifications.length),

    selectNotificationById: (id: string) => (state: NotificationState) =>
        state.notifications.find((n) => n.id === id),

    selectMetadata: (id: string, key: string) => (state: NotificationState) =>
        state.notifications.find((n) => n.id === id)?.metadata?.[key],

    selectDefaultDuration: (state: NotificationState) => state.notifications[0]?.duration ?? NOTIFICATION_DEFAULTS.DEFAULT_DURATION,
};

export const notificationActions = {
    add: (notification: Omit<Notification, 'id' | 'createdAt'>) => useNotificationStore.getState().add(notification),
    remove: (id: string) => useNotificationStore.getState().remove(id),
    clear: () => useNotificationStore.getState().clear(),
    update: (id: string, updates: Partial<Notification>) => useNotificationStore.getState().update(id, updates),
    pause: () => useNotificationStore.getState().pause(),
    resume: () => useNotificationStore.getState().resume(),
    reset: () => useNotificationStore.getState().reset(),
};

export default useNotificationStore;