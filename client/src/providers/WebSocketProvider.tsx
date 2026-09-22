import { useWebSocketStore } from "../store";
import React, { createContext, useContext, useMemo } from "react";

interface useWebSocketValue {
    isConnected: boolean;
    status: string;
    reconnectAttempts: number;
}

const WebSocketContext = createContext<useWebSocketValue | undefined>(undefined);

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error("useWebSocket must be used within WebSocketProvider");
    }
    return context;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const {
        isConnected,
        status,
        reconnectAttempts,
    } = useWebSocketStore();

    const value = useMemo(
        () => ({ isConnected, status, reconnectAttempts }),
        [isConnected, status, reconnectAttempts]
    );

    return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

export default WebSocketProvider;