import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export interface WebSocketState {
    status: ConnectionStatus;
    isConnected: boolean;
    url: string | null;
    lastConnectedAt: number | null;
    lastDisconnectedAt: number | null;

    reconnectAttempts: number;
    maxReconnectAttempts: number;
    messagesReceived: number;
    messagesSent: number;
    bytesReceived: number;
    bytesSent: number;
    avgLatency: number;
    lastLatency: number;

    lastHeartbeat: number | null;
    heartbeatInterval: number;
    error: string | null;

    subscriptions: string[];

    setStatus: (status: ConnectionStatus) => void;
    setConnected: (url: string) => void;
    setDisconnected: () => void;
    setError: (error: string) => void;
    incrementReconnectAttempts: () => void;
    resetReconnectAttempts: () => void;
    setMaxReconnectAttempts: (max: number) => void;
    recordMessage: (type: 'sent' | 'received', size?: number, latency?: number) => void;
    updateHeartbeat: () => void;
    addSubscription: (channel: string) => void;
    removeSubscription: (channel: string) => void;
    clearSubscriptions: () => void;
    reset: () => void;
}

export const useWebSocketStore = create<WebSocketState>()(
    subscribeWithSelector(
        immer<WebSocketState>((set) => ({
            status: 'disconnected',
            isConnected: false,
            url: null,
            lastConnectedAt: null,
            lastDisconnectedAt: null,
            reconnectAttempts: 0,
            maxReconnectAttempts: 5,
            messagesReceived: 0,
            messagesSent: 0,
            bytesReceived: 0,
            bytesSent: 0,
            avgLatency: 0,
            lastLatency: 0,
            lastHeartbeat: null,
            heartbeatInterval: 10000,
            error: null,
            subscriptions: [],

            setStatus: (status) => set({ status }),
            setConnected: (url) => set({ status: 'connected', isConnected: true, url, lastConnectedAt: Date.now(), reconnectAttempts: 0, error: null }),
            setDisconnected: () => set({ status: 'disconnected', isConnected: false, lastDisconnectedAt: Date.now(), error: null }),
            setError: (error) => set({ status: 'error', error }),
            incrementReconnectAttempts: () => set((state) => ({ reconnectAttempts: state.reconnectAttempts + 1 })),
            resetReconnectAttempts: () => set({ reconnectAttempts: 0 }),
            setMaxReconnectAttempts: (max) => set({ maxReconnectAttempts: max }),
            recordMessage: (type, size, latency) => set((state) => {
                const totalReceived = type === 'received' ? state.messagesReceived + 1 : state.messagesReceived;
                const totalSent = type === 'sent' ? state.messagesSent + 1 : state.messagesSent;
                const totalBytesReceived = type === 'received' && size ? state.bytesReceived + size : state.bytesReceived;
                const totalBytesSent = type === 'sent' && size ? state.bytesSent + size : state.bytesSent;
                const newAvgLatency = latency !== undefined
                    ? (state.avgLatency * state.messagesReceived + latency) / totalReceived
                    : state.avgLatency;

                return {
                    messagesReceived: totalReceived,
                    messagesSent: totalSent,
                    bytesReceived: totalBytesReceived,
                    bytesSent: totalBytesSent,
                    avgLatency: newAvgLatency,
                    lastLatency: latency !== undefined ? latency : state.lastLatency,
                };
            }),
            updateHeartbeat: () => set({ lastHeartbeat: Date.now() }),
            addSubscription: (channel) => set((state) => {
                if (!state.subscriptions.includes(channel)) {
                    state.subscriptions.push(channel);
                }
            }),
            removeSubscription: (channel) => set((state) => {
                state.subscriptions = state.subscriptions.filter((sub) => sub !== channel);
            }),
            clearSubscriptions: () => set({ subscriptions: [] }),
            reset: () => set({
                status: 'disconnected',
                isConnected: false,
                url: null,
                lastConnectedAt: null,
                lastDisconnectedAt: null,
                reconnectAttempts: 0,
                messagesReceived: 0,
                messagesSent: 0,
                bytesReceived: 0,
                bytesSent: 0,
                avgLatency: 0,
                lastLatency: 0,
                lastHeartbeat: null,
                error: null,
                subscriptions: [],
            }),
        }))
    )
);

export const selectors = {
    selectStatus: (state: WebSocketState) => state.status,
    selectIsConnected: (state: WebSocketState) => state.isConnected,
    selectUrl: (state: WebSocketState) => state.url,
    selectLastConnectedAt: (state: WebSocketState) => state.lastConnectedAt,
    selectLastDisconnectedAt: (state: WebSocketState) => state.lastDisconnectedAt,
    selectReconnectAttempts: (state: WebSocketState) => state.reconnectAttempts,
    selectMaxReconnectAttempts: (state: WebSocketState) => state.maxReconnectAttempts,
    selectMessagesReceived: (state: WebSocketState) => state.messagesReceived,
    selectMessagesSent: (state: WebSocketState) => state.messagesSent,
    selectBytesReceived: (state: WebSocketState) => state.bytesReceived,
    selectBytesSent: (state: WebSocketState) => state.bytesSent,
    selectAvgLatency: (state: WebSocketState) => state.avgLatency,
    selectLastLatency: (state: WebSocketState) => state.lastLatency,
    selectTotalTraffic: (state: WebSocketState) => state.bytesReceived + state.bytesSent,
    selectMessageRate: (state: WebSocketState) => state.messagesReceived / (Date.now() - (state.lastConnectedAt || Date.now())) * 1000 || 0,
    selectLastHeartbeat: (state: WebSocketState) => state.lastHeartbeat,
    selectHeartbeatInterval: (state: WebSocketState) => state.heartbeatInterval,
    selectError: (state: WebSocketState) => state.error,
    selectSubscriptions: (state: WebSocketState) => state.subscriptions,
    selectIsSubscribed: (channel: string) => (state: WebSocketState) => state.subscriptions.includes(channel),
};

export default useWebSocketStore;