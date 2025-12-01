import { createContext, useContext, useState } from 'react';
import InAppNotification from '../components/notifications/InAppNotification';

const NotificationContext = createContext();

export const useNotification = () => {
    return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const showNotification = (title, body) => {
        setNotification({ title, body });
    };

    const hideNotification = () => {
        setNotification(null);
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <InAppNotification notification={notification} onClose={hideNotification} />
        </NotificationContext.Provider>
    );
};

export default NotificationContext;
