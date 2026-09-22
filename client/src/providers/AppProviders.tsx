import { WebSocketProvider } from "./WebSocketProvider";
import { ThemeProvider } from "./ThemeProvider";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { AuthProvider } from "./AuthProvider";

interface AppProviderProps { children: React.ReactNode, queryClient: QueryClient }

export const AppProviders: React.FC<AppProviderProps> = ({
    children,
    queryClient,
}) => {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <ThemeProvider>
                    <AuthProvider>
                        <WebSocketProvider>
                            <MotionConfig
                                reducedMotion="user"
                                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                            >
                                {children}
                            </MotionConfig>
                        </WebSocketProvider>
                    </AuthProvider>
                </ThemeProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
};

export default AppProviders;