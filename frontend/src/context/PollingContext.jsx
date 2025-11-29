import { createContext, useContext, useState, useEffect } from "react";
import { useSocketContext } from "./SocketContext";

const PollingContext = createContext();

export const usePollingContext = () => {
    return useContext(PollingContext);
};

export const PollingContextProvider = ({ children }) => {
    const [isPollingEnabled, setIsPollingEnabled] = useState(true);
    const [pollingInterval, setPollingInterval] = useState(3000);
    const { socket } = useSocketContext();
    const [isSocketConnected, setIsSocketConnected] = useState(false);

    // Monitor socket connection status
    useEffect(() => {
        if (socket) {
            setIsSocketConnected(socket.connected);

            const onConnect = () => setIsSocketConnected(true);
            const onDisconnect = () => setIsSocketConnected(false);

            socket.on("connect", onConnect);
            socket.on("disconnect", onDisconnect);

            return () => {
                socket.off("connect", onConnect);
                socket.off("disconnect", onDisconnect);
            };
        } else {
            setIsSocketConnected(false);
        }
    }, [socket]);

    // Auto-enable polling if socket disconnects, disable if connected (unless forced)
    useEffect(() => {
        if (isSocketConnected) {
            // Optional: keep polling disabled when socket is active to save resources
            // Or keep it enabled as backup. Let's keep it as backup but with longer interval
            setPollingInterval(10000);
        } else {
            // Fallback mode: frequent polling
            setPollingInterval(3000);
        }
    }, [isSocketConnected]);

    return (
        <PollingContext.Provider value={{
            isPollingEnabled,
            setIsPollingEnabled,
            pollingInterval,
            setPollingInterval,
            isSocketConnected
        }}>
            {children}
        </PollingContext.Provider>
    );
};
